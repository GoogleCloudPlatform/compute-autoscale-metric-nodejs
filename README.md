# Compute Engine Autoscaling Using Stackdriver Custom Metrics
This code is an example reference implementation for the Compute Engine Autoscaling Using Stackdriver Custom Metrics [tutorial](https://cloud.google.com/solutions/autoscaling-instance-group-with-custom-stackdrivers-metric) on the Google Cloud solutions site.

# Components
* writeToCustomMetric.js - a NodeJS app that uses the Google Cloud SDK client to write a custom monitoring metric 
* writeToCustomMetric.sh - a simple bash script to execute the writeToCustomMetric.js 
* startup.sh - a startup script used to install the necessary components (including the script and NodeJS app above) on each new Google Compute Engine VM 


# Installation
1. Follow the detailed steps in the Compute Engine Autoscaling Using Stackdriver Custom Metrics [tutorial](https://cloud.google.com/solutions/autoscaling-instance-group-with-custom-stackdrivers-metric) to configure and deploy the code
