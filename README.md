# PrematureAtherosclerosisFamilyTree

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.0.2.

![Demo](https://github.com/aespogom/PrematureAtherosclerosisFamilyTree/blob/main/src/assets/images/premature-atherosclerosis-demo.gif)

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)

## Introduction
PrematureAtherosclerosisFamilyTree Application is a powerful web-based tool built using the Angular framework. It enables users, including both doctors and patients, to create comprehensive genealogy trees based on family cardiovascular medical history and risk factors. The application extracts relevant information from a formulary, which includes data on risk factors such as diabetes, hypertension, and more.

With this application, users can visualize and analyze up to five generations of a family tree, allowing for a comprehensive overview of the cardiovascular risk within a family lineage. Each individual in the tree is represented by icons that indicate the presence of specific risk factors, providing an intuitive and visually informative representation.

The user interface of the application is meticulously designed to be both simple and elegant. This ensures that both doctors and patients can effortlessly navigate and comprehend the cardiovascular risk assessment. The intuitive nature of the interface allows users to quickly identify patterns, recognize potential risk factors, and make informed decisions regarding preventive measures and treatment options.

PrematureAtherosclerosisFamilyTree serves as a valuable tool for healthcare professionals and individuals alike, facilitating a deeper understanding of familial cardiovascular risk factors. By leveraging the power of Angular and providing an elegant user experience, this application empowers users to make informed decisions and take proactive steps towards mitigating the risks associated with cardiovascular diseases.

- **Dynamic Tree Visualization**: The application generates interactive genealogy trees that can display up to five generations, providing a comprehensive view of familial relationships and cardiovascular risk factors.

- **Risk Factor Interpretability**: Each individual in the genealogy tree is represented by icons that visually indicate the presence of specific risk factors, enabling users to easily identify potential areas of concern.

- **Comprehensive Cardiovascular Risk Assessment**: By utilizing the family medical history and risk factor data, the application performs a thorough assessment of cardiovascular risk, empowering doctors and patients with valuable insights.

- **Simple and Elegant User Interface**: The intuitive and visually appealing user interface ensures that doctors and patients can effortlessly navigate the application and understand the cardiovascular risk assessment results.


## Installation

To install and run the Angular project locally, follow the steps below:

1. Ensure that you have **Node.js** installed on your machine. You can download it from [https://nodejs.org](https://nodejs.org) if you don't have it already.
2. Clone the project repository to your local machine using Git or download the project as a ZIP file.
3. Open a terminal or command prompt and navigate to the project's root directory.
4. Run the following command to install the project dependencies:

   ```shell
   npm install
   ```

   This will download and install all the required dependencies defined in the `package.json` file.
5. Place our secret keys in a secure environment file

## Usage

After completing the installation steps, you can use the following commands to interact with the Angular project:

- **Development server**: Run `ng serve` for a dev server. Navigate to `http://localhost:4200/` in your web browser to access the application. The app will automatically reload if you change any of the source files.

- **Build**: Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.


Be sure to check the project's `package.json` file for additional scripts and commands you can use.

## Folder Structure

The Angular project follows a standard folder structure, which is as follows:

```
angular-project/
  |-- src/
      |-- app/
          |-- components/
          |-- core/
          |-- interceptors/
          |-- loader/
          |-- services/
          |-- models/
          |-- utilities/
          |-- app.module.ts
          |-- app.component.ts
          |-- ...
      |-- assets/
      |-- environments/
      |-- ...
  |-- angular.json
  |-- package.json
  |-- ...
```

Here's a brief description of some important folders and files:

- `src/`: Contains the source code of the application.
- `src/app/`: Contains the main application code, including components, services, models, and other related files.
- `src/assets/`: Stores static assets such as images, fonts, etc.
- `src/environments/`: Contains environment-specific configuration files.
- `angular.json`: The Angular project configuration file.
- `package.json`: Defines the project dependencies, scripts, and other metadata.

## Contributing

If you'd like to contribute to the Angular project, you can follow these steps:

1. Fork the project repository.
2. Create a new branch for your feature or bug fix.
3. Make the necessary changes in your branch.
4. Test your changes to ensure they work as expected.
5. Commit your changes and push them to your forked repository.
6. Open a pull request in the original repository

 and provide a detailed description of your changes.

