# APP

Documentation regarding src/app

## Table of Contents

- [App component](#app-component)
- [App module](#app-module)
- [App routing](#app-routing)
- [Components](#components)
- [Core](#core)
- [Interceptors](#interceptors)
- [Loader](#loader)
- [Models](#models)
- [Services](#services)
- [Utilities](#utilities)

## App component

Main component of the application.
It is the first component to be rendered when starting the application.
In this component the application is authenticated in Castor to be able to receive all the necessary information.

## App module

Main module of the application.
In this module the configuration of the application is made.
This involves declaring, importing and exporting internal or external modules.

## App routing

Application routing.
In this module the different routes and the corresponding components are configured.
Currently no additional route to the root is implemented.

## Components

Here are the list of components for this Angular project:

1. **errorpage**: Pop up configured to pick up any application errors and display the formatted message to the user.
2. **footer**: Footer element that presents information about the university and department to which this project belongs.
3. **patients-view**: Component showing the list of survey participants. Only those whose survey is 100% completed are displayed.
4. **sidenav**: Component that holds the left side menu. 
5. **spinner**: Spinner displayed while waiting to receive information from time consuming processes.
6. **tree-view**: Component that hosts the visualization of the family tree.

## Core

Module in charge of intercepting any error that occurs in the application in the form of middleware.

## Interceptors

Module in charge of intercepting any request and adding the corresponding authentication and route.

## Loader

Module in charge of intercepting HTML text and translating it into the selected language.

## Models

Here are the list of models used in this Angular project:

1. **answer**: Models the responses of a study.
2. **icons**: Models the icons used in the tree.
3. **patient**: Models the patient (each node of the tree) .
4. **study**: Models the study. 
5. **tree**: Models the chart (or tree).

## Services

Here are the list of services used in this Angular project:

1. **castor-api**: Service in charge of all necessary requests to Castor.
2. **error-dialog**: Service in charge of displaying a pop up if an error occurs in the application.
3. **spinner**: Service in charge of teaching the spinner during tiem consuming processes.

## Utilities

1. **constants**: File that contains several constants used during several modules.
2. **survey_field_mapping**: JSON file that contains all the survey questions with the corresponding ID.