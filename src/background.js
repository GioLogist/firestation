import path from "path";
import url from "url";
import { app, Menu } from "electron";
import { devMenuTemplate } from "./menu/dev_menu_template";
import { editMenuTemplate } from "./menu/edit_menu_template";
import createWindow from "./helpers/window";
// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";

const setApplicationMenu = () => {
  const menus = [editMenuTemplate];
  if (env.name !== "production") {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

let installExtension, REACT_DEVELOPER_TOOLS;
if (env.name === "development") {
  let devtools = require("electron-devtools-installer");
  installExtension = devtools.default;
  REACT_DEVELOPER_TOOLS = devtools.REACT_DEVELOPER_TOOLS;
}

app.on("ready", () => {
  setApplicationMenu();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "app.html"),
      protocol: "file:",
      slashes: true
    })
  );

  if (env.name === "development") {
    mainWindow.openDevTools();
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => {
        console.log(`Added Extension:  ${name}`);
      })
      .catch(err => {
        console.log("An error occurred: ", err);
      });
  }
});

app.on("window-all-closed", () => {
  app.quit();
});
