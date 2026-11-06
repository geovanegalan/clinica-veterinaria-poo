import { MainController } from "./controller/MainController";
import { Database } from "./database/Database";
import { MainScreen } from "./view/MainScreen";

const database = new Database();
const controller = new MainController(database);
const screen = new MainScreen(controller);
screen.start();
