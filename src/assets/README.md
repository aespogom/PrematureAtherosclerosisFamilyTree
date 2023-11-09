# ASSETS

Documentation regarding src/assets

## Table of Contents

- [Lang](#lang)
- [Images](#images)
- [Web manifest](#web-manifest)

## Lang

Inside the following folder, you will find the necessary files for the translation of the application.
Each JSON file contains the terms used in the HTML in a given language.
For correct operation, all files need to contain the same keys in JSON format.
Then, through a pipe called "translate", you choose one language or another for the visualization.

## Images

Inside the following folder, you will find all the images used in the application.
Both official logos of the university and the corresponding formats for the correct visualization in different devices.

## Web manifest

The web manifest is a JSON file that provides metadata about your Angular application. It allows you to control how your application appears and behaves when installed on a user's device, such as a mobile device or a desktop computer.

Here are the principal information that a web manifest declares in an Angular project:

1. **name**: The name of the web application. This is typically displayed when the application is installed or pinned to the user's device.
2. **short_name**: An abbreviated name for the web application, usually used when there is limited space to display the full name.
3. **start_url**: The URL that the application should open when launched from a user's home screen or app launcher.
4. **display**: Specifies the display mode of the application. Common values include "standalone", "fullscreen", "minimal-ui", and "browser". This determines how the application appears and behaves when launched.
5. **background_color**: The background color of the application's splash screen or when the application is loading.
6. **theme_color**: The color that the browser's UI elements should use when the application is launched.
7. **icons**: An array of icon objects that specify the application's icons of different sizes. Each object typically includes the `src` (path to the icon file), `sizes` (dimensions of the icon), and `type` (file format of the icon) properties.

