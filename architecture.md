# Code Architecture

## Main code

1. validate & generate final config
2. exit if error status
3. validate & generate server elements
4. exit if error status
5. apply server blocks
   - apply view
   - apply middlewares
6. start server

## Validate & generate final config

### Code

1. get from config.ini file:
   - server root directory (rootDir),
   - default config directories,
   - initial server config object
2. get path to local server configuration file
   - from cli argument if provided (report error if provided an invalid path)
   - from default config directories
3. if local config exists merge it with the initial config file
4. export final configuration object

### Helpers

- getConfPath - get path to config file (null if not found, error if path from args is invalid)
  - from cli arguments, and if not found
  - from default config directories (specified in config.ini)
- argValue - provides value of specified argument (undefined if not provided)

## Validate & generate server elements

### Code

Iterate over the array of server feature names and use the object of functions, which validate & generate feature objects, together with respective cofig object values to create an array of server feature objects.

### Helpers

- validateAndGetServerFeatures - takes server config object, validates each config definition of server features, report definition errors. Untill no error are detected, generates idividual server feature objects after successfull validation and returns all the feature objects in an object wrapper. Wrapper includes the apply() function which deploys all the features.
- Status - class to generate 'status' instance which is used to report errors (status.reportErr) and automatically maintains the current error status (status.error)
- serverFeatureNames - array of server feature names
- validateFeatureConfig - object of methods to validate individual config definition of server features
- getFeature - object of methods to generate individual, standarized server feature object/class
- validate\<SpecificServerFeature\>Config - a specific validation function written for each server feature. Uses 'status', provided as 2nd argument, to report errors and return error status.
- get\<SpecificServerFeature\> - a specific "getFeature" function written for each server feature. Generate a feature object/class with an additional apply() method to deploy given feature.

## Apply server blocks

### Code

Iterate over the array of server elements and invoke their apply() methods

## Start server

### Code

1. Get the 'startServer' function.
2. Invoke the 'startServer' function providing 'app' and 'port' as its arguments.

### Helpers

'startServer' - function which starts the server, taking as its arguments 'app' and 'port', to run the server at.

## Directories

- bin - includes the executable file which handles the cli commands
- modules - top directory for all modules used by the 'frame-server'
  - classes - includes all local classes used in the server code
  - config - keeps iniial config file and the module generating a final configuration object
  - deployment - holds the modules used for server deployment
  - helpers - includes files with helper functions decided, for any reason, to be put externally
  - install - groups the modules used during server installatio process
  - server-elements - keeps the modules related to validation and generation of specific server elements
- test - top directory for test files. Replicates the 'modules' directory structure for a clear indication which modules are covered by a given test.
