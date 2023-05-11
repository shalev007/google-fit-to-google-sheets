# Google Fit to Google Sheets Data Transfer

## Description

This project aims to transfer data from Google Fit to Google Sheets automatically using TypeScript. It uses the Google Fit API to retrieve user data and the Google Sheets API to write the data to a specific Google Sheet. This project can be useful for individuals or organizations who want to keep track of their fitness progress in a more convenient and organized way.

## Features

- Automatically retrieves fitness data from Google Fit.
- Writes data to a specific Google Sheet.
- Can be scheduled to run at specific intervals.

## Installation

1. Clone the repository: `git clone https://github.com/shalev007/google-fit-to-google-sheets.git`
2. Navigate to the project directory: `cd google-fit-to-google-sheets`
3. Install the required packages: `npm install`
4. Follow the instructions in the **Configuration** section to set up your credentials and authorize the application.
5. Run the application: `npm start`

## Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
2. Enable the Google Fit API and Google Sheets API for your project.
3. Create credentials for a **Web App**.
4. Download the credentials file and save it in the project directory as `.env`.
5. Follow the on-screen instructions to grant permission to the application.
6. Open the `.env` file and enter the ID of the Google Sheet you want to write to.
7. Save the `config.json` file.

## Usage

- To run the application manually: `npm start`
- To schedule the application to run at specific intervals, use a task scheduler like [cron](https://en.wikipedia.org/wiki/Cron) (Linux) or [Task Scheduler](https://en.wikipedia.org/wiki/Windows_Task_Scheduler) (Windows).

## Support

If you have any questions or issues, please create an issue in the [GitHub repository](https://github.com/shalev007/google-fit-to-google-sheets.git/issues).

## Contributing

Contributions are welcome! If you want to contribute to this project, please create a pull request with your changes.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
