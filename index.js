#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import os from "os";
import chalk from "chalk";
import ora from "ora";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

// ASCII Art Banner
const banner = `
 __  __ _____ ____  _   _ ____   ___   ___ _____
|  \\/  | ____|  _ \\| \\ | | __ ) / _ \\ / _ \\_   _|
| |\\/| |  _| | |_) |  \\| |  _ \\| | | | | | || |  
| |  | | |___|  _ <| |\\  | |_) | |_| | |_| || |  
|_|  |_|_____|_| \\_\\_| \\_|____/ \\___/ \\___/ |_|  
`;

// Display banner with colors
console.log(chalk.blue.bold(banner));

async function showMenu() {
  console.log("\n" + chalk.blue.bold("🚀 MERN Stack Project Generator"));
  console.log(chalk.gray("-----------------------------"));
  console.log(chalk.white("1. MongoDB Atlas Setup"));
  console.log(chalk.white("2. Get MongoDB URL"));
  console.log(chalk.white("3. Backend (Node.js + Express + MongoDB)"));
  console.log(chalk.white("4. Frontend (React + Vite + Tailwind)"));
  console.log(chalk.white("5. Full Stack (Backend + Frontend)"));
  console.log(chalk.white("6. Exit"));

  const choice = await question(chalk.yellow("\nSelect an option (1-6): "));
  return choice;
}

async function showMongoDBMenu() {
  console.clear();
  console.log(chalk.blue.bold("\n🌟 MongoDB Atlas Setup"));
  console.log(chalk.gray("-----------------------------"));

  // Display the note at the top of the menu
  console.log(chalk.yellow("\n⚠️  Authentication Note:"));
  console.log(chalk.gray("-----------------------------"));
  console.log(
    chalk.white(
      " * If you encounter authentication errors, use option 2 to logout"
    )
  );
  console.log(chalk.white(" * Then try creating a new cluster again"));
  console.log(
    chalk.white(" * This will help avoid 'already authenticated' errors")
  );
  console.log(chalk.gray("-----------------------------\n"));

  console.log(chalk.white("1. Create new MongoDB Atlas cluster"));
  console.log(chalk.white("2. Logout from MongoDB Atlas"));
  console.log(chalk.white("3. Back to main menu"));

  return question(chalk.yellow("\nSelect an option (1-3): "));
}

async function createViteReact(location) {
  const spinner = ora();
  try {
    spinner.start(chalk.blue("Creating Vite React app..."));
    execSync(`npm create vite@latest ${location} -- --template react`, {
      stdio: "inherit",
    });
    spinner.succeed(chalk.green("✅ Vite React app created successfully"));

    // Change to the client directory and install dependencies
    const clientPath = path.join(process.cwd(), location);
    process.chdir(clientPath);

    spinner.start(chalk.blue("Installing client dependencies..."));
    execSync("npm install", { stdio: "inherit" });
    spinner.succeed(chalk.green("✅ Client dependencies installed"));

    spinner.start(chalk.blue("Setting up Tailwind CSS..."));
    execSync("npm install tailwindcss @tailwindcss/vite", { stdio: "inherit" });
    spinner.succeed(chalk.green("✅ Tailwind CSS installed"));

    // Update index.css with Tailwind directives
    const tailwindCss = `@import "tailwindcss";`;
    fs.writeFileSync(path.join(clientPath, "src", "index.css"), tailwindCss);

    const envViteContent = `VITE_BACKEND_URL=http://localhost:5000/api`;
    fs.writeFileSync(path.join(clientPath, ".env"), envViteContent);

    // Copy template files
    spinner.start(chalk.blue("Copying template files..."));

    // Copy infinity.svg to public folder
    const infinitySvgSource = path.join(
      __dirname,
      "configs",
      "React-Template",
      "infinity.svg"
    );
    const infinitySvgDest = path.join(clientPath, "public", "infinity.svg");
    fs.copyFileSync(infinitySvgSource, infinitySvgDest);

    // Copy App.jsx to src folder
    const appJsxSource = path.join(
      __dirname,
      "configs",
      "React-Template",
      "App.jsx"
    );
    const appJsxDest = path.join(clientPath, "src", "App.jsx");
    fs.copyFileSync(appJsxSource, appJsxDest);

    // Copy App.css to src folder
    const appCssSource = path.join(
      __dirname,
      "configs",
      "React-Template",
      "App.css"
    );
    const appCssDest = path.join(clientPath, "src", "App.css");
    fs.copyFileSync(appCssSource, appCssDest);

    // Update index.html to use infinity.svg as favicon and change title
    const indexHtmlPath = path.join(clientPath, "index.html");
    let indexHtmlContent = fs.readFileSync(indexHtmlPath, "utf8");
    indexHtmlContent = indexHtmlContent
      .replace('href="/vite.svg"', 'href="/infinity.svg"')
      .replace("<title>Vite + React</title>", "<title>MERNBOOT</title>");
    fs.writeFileSync(indexHtmlPath, indexHtmlContent);

    spinner.succeed(chalk.green("Copied template files"));

    const viteConfigContent = `
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [tailwindcss(), react()]
})`;

    fs.writeFileSync(
      path.join(clientPath, "vite.config.js"),
      viteConfigContent
    );
    spinner.succeed(chalk.green("Set up Tailwind CSS and configuration"));

    // Return to the original directory
    process.chdir(process.cwd());
  } catch (error) {
    spinner.fail(
      chalk.red(`Failed to create Vite React app: ${error.message}`)
    );
    throw error;
  }
}

async function checkAtlasCLI() {
  try {
    execSync("atlas --version", { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
}

async function installAtlasCLI() {
  const spinner = ora("Installing MongoDB Atlas CLI...").start();
  try {
    execSync("winget install -e --id MongoDB.MongoDBAtlasCLI", {
      stdio: "inherit",
    });
    spinner.succeed(
      chalk.green("✅ MongoDB Atlas CLI installed successfully!")
    );
    return true;
  } catch (error) {
    spinner.fail(
      chalk.red("❌ Failed to install MongoDB Atlas CLI:") + " " + error.message
    );
    return false;
  }
}

async function checkAtlasAuth() {
  try {
    // First check atlas config list
    const configOutput = execSync("atlas config list", { encoding: "utf8" });
    const hasProfile =
      configOutput.includes("default") ||
      configOutput.trim().split("\n").length > 1;

    if (hasProfile) {
      // If we have a profile, we're logged in
      const profileName = configOutput.trim().split("\n")[1] || "default";
      console.log(`\n✅ Already logged in with profile: ${profileName}`);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

async function storeAtlasConfig(config) {
  const userHomeDir = os.homedir();
  const configDir = path.join(userHomeDir, ".mern-starter");
  const configFile = path.join(configDir, "atlas-config.json");

  // Create directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Store the configuration
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

async function getStoredAtlasConfig() {
  const userHomeDir = os.homedir();
  const configFile = path.join(
    userHomeDir,
    ".mern-starter",
    "atlas-config.json"
  );

  if (fs.existsSync(configFile)) {
    return JSON.parse(fs.readFileSync(configFile, "utf8"));
  }
  return null;
}

async function checkClusterStatus(projectId, clusterName) {
  try {
    const output = execSync(
      `atlas clusters describe ${clusterName} --projectId ${projectId}`,
      { encoding: "utf8" }
    );
    const statusMatch = output.match(/StateName: ([A-Z_]+)/);
    return statusMatch ? statusMatch[1] : null;
  } catch (error) {
    return null;
  }
}

async function waitForClusterCreation(projectId, clusterName) {
  console.log("\n⏳ Waiting for cluster to be ready...");
  console.log("This may take a few minutes. Please wait...");

  let status;
  let attempts = 0;
  const maxAttempts = 30; // 5 minutes total (10 seconds * 30)

  while (attempts < maxAttempts) {
    status = await checkClusterStatus(projectId, clusterName);

    if (status === "IDLE") {
      console.log("\n✅ Cluster is ready!");
      return true;
    }

    if (status === "CREATING") {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      attempts++;
    } else {
      console.log("\n❌ Unexpected cluster status:", status);
      return false;
    }
  }

  console.log("\n⚠️ Cluster creation is taking longer than expected.");
  console.log("You can check the status later using 'Get MongoDB URL' option.");
  return false;
}

async function handleMongoDBLogout() {
  const spinner = ora("Logging out from MongoDB Atlas...").start();
  try {
    execSync("atlas auth logout --force", { stdio: "inherit" });
    spinner.succeed(
      chalk.green("✅ Successfully logged out from MongoDB Atlas")
    );
    console.log(chalk.yellow("\nPlease log in again to continue."));
    return true;
  } catch (error) {
    spinner.fail(chalk.red("❌ Failed to logout:") + " " + error.message);
    return false;
  }
}

async function setupMongoDBAtlas() {
  const spinner = ora();
  try {
    const isAtlasInstalled = await checkAtlasCLI();
    if (!isAtlasInstalled) {
      spinner.start(chalk.blue("Installing MongoDB Atlas CLI..."));
      const installed = await installAtlasCLI();
      if (!installed) {
        spinner.fail(chalk.red("Failed to install MongoDB Atlas CLI"));
        throw new Error("Failed to install MongoDB Atlas CLI");
      }
      spinner.succeed(chalk.green("MongoDB Atlas CLI installed"));
    }

    while (true) {
      const mongoChoice = await showMongoDBMenu();

      switch (mongoChoice) {
        case "1":
          // Check if already logged in using atlas config list
          const isLoggedIn = await checkAtlasAuth();
          if (!isLoggedIn) {
            // Login to Atlas using browser authentication
            console.log("\n🔐 Logging into MongoDB Atlas...");
            console.log("Please follow the browser authentication process...");
            try {
              execSync("atlas auth login", { stdio: "inherit" });
            } catch (error) {
              console.error("\n❌ Login failed:", error.message);
              continue;
            }
          }

          // Step 1: Create Project
          console.log("\n📁 Creating MongoDB Atlas Project...");
          const projectName = await question("Enter project name: ");
          const projectOutput = execSync(
            `atlas projects create "${projectName}"`,
            { encoding: "utf8" }
          );

          const projectIdMatch = projectOutput.match(
            /Project '([a-zA-Z0-9]+)' created/
          );
          if (!projectIdMatch) {
            console.error("Project creation output:", projectOutput);
            throw new Error("Failed to get project ID from Atlas CLI output");
          }
          const projectId = projectIdMatch[1];
          console.log(`✅ Project created with ID: ${projectId}`);

          // Step 2: Create Cluster
          console.log("\n🔄 Creating MongoDB Atlas Cluster...");
          const clusterName =
            (await question("Enter cluster name (default: myCluster): ")) ||
            "myCluster";

          try {
            execSync(
              `atlas clusters create ${clusterName} --projectId ${projectId} --provider AWS --region US_EAST_1 --tier M0`,
              { stdio: "inherit" }
            );
            console.log(`\n✅ Cluster ${clusterName} creation initiated`);
          } catch (error) {
            console.error(`❌ Failed to create cluster: ${error.message}`);
            continue;
          }

          // Step 3: Create Database User
          console.log("\n👤 Creating Database User...");
          const username = await question("Enter database username: ");
          const password = await question("Enter database password: ");

          try {
            execSync(
              `atlas dbusers create --username ${username} --password ${password} --projectId ${projectId} --role readWriteAnyDatabase`,
              { stdio: "inherit" }
            );
            console.log(`✅ Database user ${username} created successfully`);
          } catch (error) {
            console.error(
              `❌ Failed to create database user: ${error.message}`
            );
            continue;
          }

          // Step 4: Add IP Access List
          console.log("\n🌐 Adding IP Access List...");
          try {
            execSync(
              `atlas accessList create 0.0.0.0/0 --comment "Allow access from anywhere" --projectId ${projectId}`,
              { stdio: "inherit" }
            );
            console.log("✅ IP Access List created successfully");
          } catch (error) {
            if (error.message.includes("already exists")) {
              console.log("✅ IP Access List already exists");
            } else {
              console.error(
                `❌ Failed to create IP Access List: ${error.message}`
              );
              continue;
            }
          }

          // Store configuration for future use
          await storeAtlasConfig({
            projectId,
            clusterName,
            username,
          });

          // Wait for cluster to be ready
          const isReady = await waitForClusterCreation(projectId, clusterName);

          if (isReady) {
            console.log("\n✅ MongoDB Atlas setup completed successfully!");
            console.log(
              "\nYou can now use 'Get MongoDB URL' option to get your connection string."
            );
          } else {
            console.log("\n⚠️ MongoDB Atlas setup is in progress.");
            console.log(
              "Please wait a few minutes and use 'Get MongoDB URL' option to check the status."
            );
          }
          return await showMenu();

        case "2":
          await handleMongoDBLogout();
          continue;

        case "3":
          return await showMenu();

        default:
          console.log("\n❌ Invalid option. Please try again.");
          continue;
      }
    }
  } catch (error) {
    console.error("\n❌ MongoDB Atlas setup failed:", error.message);
    return await showMenu();
  }
}

async function getMongoDBUrlFromConfig() {
  try {
    const config = await getStoredAtlasConfig();
    if (!config) {
      console.log(
        "\n❌ No MongoDB Atlas configuration found. Please set up MongoDB Atlas first."
      );
      return null;
    }

    console.log("\n🔍 Getting MongoDB URL from existing configuration...");
    console.log(`Project ID: ${config.projectId}`);
    console.log(`Cluster Name: ${config.clusterName}`);

    // Get fresh connection string
    let connectionString;
    try {
      connectionString = execSync(
        `atlas clusters connectionString get ${config.clusterName} --projectId ${config.projectId}`,
        { encoding: "utf8" }
      ).trim();
    } catch (error) {
      if (error.message.includes("<nil>")) {
        console.log(
          "\n⏳ Cluster is still being created. Please wait a few minutes and try again."
        );
        console.log("This usually takes 3-5 minutes after cluster creation.");
        console.log("You can check the status again using option 2.");
        return null;
      }
      console.log(
        "\n⚠️ Failed to get connection string from existing configuration."
      );
      return null;
    }

    // Check if connection string contains <nil>
    if (connectionString.includes("<nil>")) {
      console.log(
        "\n⏳ Cluster is still being created. Please wait a few minutes and try again."
      );
      console.log("This usually takes 3-5 minutes after cluster creation.");
      console.log("You can check the status again using option 2.");
      return null;
    }

    // Get password from user
    const password = await question("\nEnter your database password: ");

    // Clean up connection string and construct full MongoDB URI
    const cleanConnectionString = connectionString
      .replace("STANDARD CONNECTION STRING\n", "")
      .trim();
    const mongoUri =
      cleanConnectionString.replace(
        "mongodb+srv://",
        `mongodb+srv://${config.username}:${password}@`
      ) + `/${config.clusterName}?retryWrites=true&w=majority`;

    console.log("\n✅ MongoDB URL retrieved successfully!");
    console.log("\n📋 Your MongoDB URL:");
    console.log(mongoUri);

    // Automatically save to .env file without prompting
    const envPath = path.join(process.cwd(), ".env");
    let envContent = "";

    // Read existing .env content if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");

      // Remove existing MONGO_URI if it exists
      envContent = envContent.replace(/MONGO_URI=.*\n?/g, "");

      // Ensure content ends with a newline
      if (!envContent.endsWith("\n")) {
        envContent += "\n";
      }
    }

    // Add new MONGO_URI at the beginning
    envContent = `MONGO_URI=${mongoUri}\n${envContent}`;

    // Write back to .env
    fs.writeFileSync(envPath, envContent);
    console.log("\n✅ MongoDB URL automatically saved to .env file");

    return mongoUri;
  } catch (error) {
    console.error("\n❌ Failed to get MongoDB URL:", error.message);
    return null;
  }
}

async function showDatabaseUrlMenu() {
  console.log("\n" + chalk.blue.bold("📦 Database URL Selection"));
  console.log(chalk.gray("-----------------------------"));
  console.log(chalk.white("1. Use recently created MongoDB URL"));
  console.log(chalk.white("2. Enter custom MongoDB URL"));
  console.log(chalk.white("3. Create new MongoDB Atlas cluster"));
  console.log(chalk.white("4. Skip MongoDB setup for now"));
  console.log(chalk.white("5. Back to main menu"));

  const choice = await question(chalk.yellow("\nSelect an option (1-5): "));
  return choice;
}

async function getDatabaseUrl() {
  while (true) {
    const dbChoice = await showDatabaseUrlMenu();

    switch (dbChoice) {
      case "1":
        const recentUrl = await getMongoDBUrlFromConfig();
        if (recentUrl) {
          return recentUrl;
        }
        console.log(
          chalk.yellow(
            "\n⚠️ No recent MongoDB URL found. Please choose another option."
          )
        );
        break;

      case "2":
        console.log(chalk.yellow("\n📋 Please paste your MongoDB URL below:"));
        console.log(chalk.gray("(You can use right-click to paste)"));
        const customUrl = await question(chalk.yellow("\nMongoDB URL: "));
        if (customUrl && customUrl.trim()) {
          // Validate the URL format
          if (
            customUrl.startsWith("mongodb://") ||
            customUrl.startsWith("mongodb+srv://")
          ) {
            return customUrl.trim();
          } else {
            console.log(
              chalk.red(
                "\n❌ Invalid MongoDB URL format. URL should start with 'mongodb://' or 'mongodb+srv://'"
              )
            );
            continue;
          }
        }
        console.log(chalk.red("\n❌ Invalid URL. Please try again."));
        break;

      case "3":
        await setupMongoDBAtlas();
        const newUrl = await getMongoDBUrlFromConfig();
        if (newUrl) {
          return newUrl;
        }
        console.log(
          chalk.yellow("\n⚠️ Failed to get new MongoDB URL. Please try again.")
        );
        break;

      case "4":
        console.log(
          chalk.yellow(
            "\n⚠️ Skipping MongoDB setup. You can set it up later by updating the .env file."
          )
        );
        return "mongodb://localhost:27017/your-database"; // Default local MongoDB URL

      case "5":
        return null;

      default:
        console.log(chalk.red("\n❌ Invalid option. Please try again."));
    }
  }
}

// Update setupBackend function to handle skipped MongoDB setup
async function setupBackend() {
  try {
    // Initialize server
    const spinner = ora("Initializing server...").start();

    // Read and write package.json
    const templatePackageJson = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "configs", "packagejson", "package.json"),
        "utf8"
      )
    );
    fs.writeFileSync(
      path.join(process.cwd(), "package.json"),
      JSON.stringify(templatePackageJson, null, 2)
    );

    // Create server.js from template
    spinner.succeed(chalk.green("✅ Server initialized"));
    spinner.start("Creating server.js...");
    const serverTemplate = fs.readFileSync(
      path.join(__dirname, "configs", "server", "server.js"),
      "utf8"
    );
    fs.writeFileSync(path.join(process.cwd(), "server.js"), serverTemplate);
    spinner.succeed(chalk.green("✅ Server.js created"));

    // Create project structure
    spinner.start("Creating project structure...");
    const folders = [
      "controllers",
      "models",
      "routes",
      "config",
      "middleware",
      "public",
      "services",
    ];

    folders.forEach((folder) => {
      if (!fs.existsSync(path.join(process.cwd(), folder))) {
        fs.mkdirSync(path.join(process.cwd(), folder));
      }
    });
    spinner.succeed(chalk.green("✅ Project structure created"));

    // Create MongoDB configuration files
    spinner.start("Setting up MongoDB configuration...");
    const mongooseFolder = path.join(process.cwd(), "config", "mongoose");
    if (!fs.existsSync(mongooseFolder)) {
      fs.mkdirSync(mongooseFolder, { recursive: true });
    }

    // Copy MongoDB configuration file
    const dbJs = fs.readFileSync(
      path.join(__dirname, "configs", "mongoose", "db.js"),
      "utf8"
    );
    fs.writeFileSync(path.join(mongooseFolder, "database.js"), dbJs);
    spinner.succeed(chalk.green("✅ MongoDB configuration created"));

    // Get MongoDB URL
    const mongoUrl = await getDatabaseUrl();
    if (!mongoUrl) {
      console.log(chalk.yellow("\n⚠️ Backend setup cancelled."));
      return;
    }

    // Create .env file with MongoDB URL
    spinner.start("Creating .env file...");
    let envContent = `PORT=5000\nNODE_ENV=development\n`;

    if (mongoUrl === "mongodb://localhost:27017/your-database") {
      envContent += `# TODO: Replace this with your MongoDB connection string\n`;
      envContent += `MONGO_URI=${mongoUrl}\n`;
      console.log(
        chalk.yellow(
          "\n⚠️ Using default local MongoDB URL. Remember to update it in .env file later."
        )
      );
    } else {
      envContent += `MONGO_URI=${mongoUrl}\n`;
    }

    fs.writeFileSync(path.join(process.cwd(), ".env"), envContent);
    spinner.succeed(chalk.green("✅ .env file created"));

    // Install server dependencies
    spinner.start("Installing server dependencies...");
    execSync("npm install", { stdio: "inherit" });
    spinner.succeed(chalk.green("✅ Server dependencies installed"));

    console.log(chalk.green("\n✅ Backend setup completed successfully!"));
    console.log(chalk.blue("\n🚀 To start the server:"));
    console.log(chalk.white("npm run dev"));
  } catch (error) {
    console.error(
      chalk.red("\n❌ Backend setup failed:") + " " + error.message
    );
  }
}

async function setupFrontend() {
  try {
    // Ask about React client location
    console.log("\n📱 React Client Setup");
    console.log("-----------------------------");
    const defaultLocation = "client";
    const clientLocation = await question(
      `Where would you like to create the React client? (Press Enter for '${defaultLocation}'): `
    );

    // Create Vite React app
    await createViteReact(clientLocation || defaultLocation);

    console.log("\n✅ Frontend setup completed successfully!");
    console.log("\n🚀 To start the frontend:");
    console.log(`cd ${clientLocation || defaultLocation} && npm run dev`);
  } catch (error) {
    console.error("\n❌ Frontend setup failed:", error.message);
  }
}

async function setupProject() {
  try {
    let choice = await showMenu();

    while (choice !== "6") {
      switch (choice) {
        case "1":
          choice = await setupMongoDBAtlas();
          break;
        case "2":
          await getMongoDBUrlFromConfig();
          choice = await showMenu();
          break;
        case "3":
          await setupBackend();
          choice = await showMenu();
          break;
        case "4":
          await setupFrontend();
          choice = await showMenu();
          break;
        case "5":
          await setupBackend();
          await setupFrontend();

          const spinner = ora("Setting up development environment...").start();
          // Install concurrently for running both server and client
          execSync("npm install -D concurrently", { stdio: "inherit" });
          spinner.succeed(
            chalk.green("✅ Development environment setup completed")
          );

          console.log(
            chalk.green("\n✅ Full Stack setup completed successfully!")
          );
          console.log(chalk.blue("\n🚀 To start development:"));
          console.log(chalk.white("1. In one terminal: npm run dev:server"));
          console.log(
            chalk.white("2. In another terminal: cd client && npm run dev")
          );
          console.log(
            chalk.white("   Or simply run: npm run dev (to start both)")
          );
          choice = await showMenu();
          break;
        default:
          console.log(chalk.red("\n❌ Invalid option. Please try again."));
          choice = await showMenu();
      }
    }

    console.log(chalk.blue("\n👋 Goodbye!"));
    process.exit(0);
  } catch (error) {
    console.error(chalk.red("\n❌ Setup failed:") + " " + error.message);
  } finally {
    rl.close();
  }
}

setupProject();
