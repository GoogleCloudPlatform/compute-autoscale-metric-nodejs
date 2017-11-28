#
# Copyright 2017 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http:#www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
set -v

# Talk to the metadata server to get the project id
PROJECTID=$(curl -s "http://metadata.google.internal/computeMetadata/v1/project/project-id" -H "Metadata-Flavor: Google")
INSTANCEID=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/id" -H "Metadata-Flavor:Google")
ZONEID=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/zone" -H "Metadata-Flavor:Google")
GCS_BUCKET_NAME=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/attributes/gcs-bucket" -H "Metadata-Flavor:Google")

# Install logging monitor. The monitor will automatically pick up logs sent to syslog.
curl -s "https://storage.googleapis.com/signals-agents/logging/google-fluentd-install.sh" | bash
service google-fluentd restart &

# Install dependencies from apt
apt-get update
apt-get install -yq ca-certificates git nodejs build-essential supervisor

# Install nodejs
mkdir /opt/nodejs
curl https://nodejs.org/dist/v6.11.2/node-v6.11.2-linux-x64.tar.gz  | tar xvzf - -C /opt/nodejs --strip-components=1
ln -s /opt/nodejs/bin/node /usr/bin/node
ln -s /opt/nodejs/bin/npm /usr/bin/npm

# Setup the script directories
mkdir /opt/app
mkdir /opt/app/autoscale_metric
cd /opt/app/autoscale_metric

# Copy the script files from your bucket to the VM
gsutil cp $GCS_BUCKET_NAME/writeToCustomMetric.js /opt/app/autoscale_metric/writeToCustomMetric.js
gsutil cp $GCS_BUCKET_NAME/writeToCustomMetric.sh /opt/app/autoscale_metric/writeToCustomMetric.sh
gsutil cp $GCS_BUCKET_NAME/config.json /opt/app/autoscale_metric/config.json
gsutil cp $GCS_BUCKET_NAME/package.json /opt/app/autoscale_metric/package.json
npm install

# Set exec permissions
chmod 755 /opt/app/autoscale_metric/writeToCustomMetric.sh 

# Create a nodeapp user. The application will run as this user.
useradd -m -d /home/nodeapp nodeapp
chown -R nodeapp:nodeapp /opt/app

# Configure supervisor to run the node app.
cat >/etc/supervisor/conf.d/node-app.conf << EOF
[program:nodeapp]
directory=/opt/app/autoscale_metric
command=bash /opt/app/autoscale_metric/writeToCustomMetric.sh $PROJECTID $INSTANCEID $ZONEID
autostart=true
autorestart=true
user=nodeapp
environment=HOME="/home/nodeapp",USER="nodeapp",NODE_ENV="production"
stdout_logfile=syslog
stderr_logfile=syslog
EOF

supervisorctl reread
supervisorctl update

# Application should now be running under supervisor
supervisorctl status all