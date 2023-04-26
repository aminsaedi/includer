const { exec } = require("child_process");
const fs = require("fs");

const allowedExtensions = ".ts,.tsx,.js,.jsx";

// Execute "git diff --cached --name-only --diff-filter=ACMR" command to get the list of staged files
exec(
  "git diff --cached --name-only --diff-filter=ACMR",
  (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }

    // Split the output by newlines to get an array of file paths
    const files = stdout.trim().split("\n");

    // Filter out files that do not have the allowed extensions
    const filteredFiles = files.filter((file) =>
      allowedExtensions.split(",").some((ext) => file.endsWith(ext))
    );

    console.log(filteredFiles, files);

    // Read the contents of the "tsconfig.strict.json" file
    const configFile = "tsconfig.strict.json";
    fs.readFile(configFile, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading ${configFile}: ${err}`);
        return;
      }

      // Parse the JSON data and update the "includes" key with the filtered staged files
      const config = JSON.parse(data);

      console.log(config.include);

      config.include = [...new Set([...config.include, ...filteredFiles])]; // Use a Set to remove duplicates and spread the arrays
      const updatedConfig = JSON.stringify(config, null, 2);

      // Write the updated configuration back to the file
      fs.writeFile(configFile, updatedConfig, "utf8", (err) => {
        if (err) {
          console.error(`Error writing to ${configFile}: ${err}`);
        } else {
          console.log(
            `Updated ${configFile} with ${filteredFiles.length} staged files`
          );
        }
      });
    });
  }
);
