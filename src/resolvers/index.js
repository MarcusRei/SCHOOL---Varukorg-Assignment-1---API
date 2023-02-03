const path = require("path");
const fsPromises = require("fs/promises");
const {
  fileExists,
  readJsonFile,
  deleteFile,
  getDirectoryFileNames,
} = require("../utils/fileHandling");
const { GraphQLError, printType } = require("graphql");
const crypto = require("crypto");
//const { availableItems } = require("../enums/availableItems");
//const axios = require("axios").default;

const usercartDirectory = path.join(__dirname, "..", "data", "usercarts");
const itemDirectory = path.join(__dirname, "..", "data", "items");
const { availableItemsEnum } = require("../enums/availableItems");

exports.resolvers = {
  Query: {
    getUsercartById: async (_, args) => {
      const usercartId = args.usercartId;

      const usercartFilePath = path.join(
        usercartDirectory,
        `${usercartId}.json`
      );

      const usercartExists = await fileExists(usercartFilePath);

      if (!usercartExists)
        return new GraphQLError("Den här varukorgen finns inte!");

      const usercartData = await fsPromises.readFile(usercartFilePath, {
        encoding: "utf-8",
      });

      const data = JSON.parse(usercartData);

      return data;
    },
    getAllUsercarts: async (_, args) => {
      const usercarts = await getDirectoryFileNames(usercartDirectory);

      const usercartData = [];

      for (const file of usercarts) {
        const filePath = path.join(usercartDirectory, file);

        const fileContents = await fsPromises.readFile(filePath, {
          encoding: "utf-8",
        });

        const data = JSON.parse(fileContents);

        usercartData.push(data);
      }

      return usercartData;
    },
    getItemById: async (_, args) => {
      const itemId = args.itemId;

      const itemFilePath = path.join(itemDirectory, `${itemId}.json`);

      const itemExists = await fileExists(itemFilePath);

      if (!itemExists)
        return new GraphQLError("Den här produkten finns inte i sortimentet!");

      const itemData = await fsPromises.readFile(itemFilePath, {
        encoding: "utf-8",
      });

      const data = JSON.parse(itemData);

      console.log(itemData);

      return data;
    },
  },
  Mutation: {
    createUsercart: async (_, args) => {
      const items = [];

      let price = 0;
      for (let i = 0; i < items.length; i++) {
        price += items[i].itemprice;
      }

      //Skapa unikt id
      const newUsercart = {
        id: crypto.randomUUID(),
        amountOfItems: items.length,
        items: items,
        totalPrice: price,
      };

      //Skapa filePath
      let filePath = path.join(usercartDirectory, `${newUsercart.id}.json`);

      let idExists = true;
      while (idExists === true) {
        const exists = await fileExists(filePath);
        console.log(exists, newUsercart.id);

        if (exists === true) {
          newUsercart.id = crypto.randomUUID();
          filePath = path.join(usercartDirectory, `${newUsercart.id}.json`);
        }

        idExists = exists;
      }

      await fsPromises.writeFile(filePath, JSON.stringify(newUsercart));

      return newUsercart;

      //return null;
    },
    addItemToUsercart: async (_, args) => {
      const { usercartId, chosenItem } = args.input;

      //filepath usercart
      const usercartFilePath = path.join(
        usercartDirectory,
        `${usercartId}.json`
      );

      //Existence check
      const usercartExists = await fileExists(usercartFilePath);
      if (!usercartExists) {
        return new GraphQLError("Den här varukorgen finns inte!");
      }

      //Read the usercart (still in JSON)
      const usercartJSON = await fsPromises.readFile(usercartFilePath, {
        encoding: "utf-8",
      });

      const usercartData = JSON.parse(usercartJSON);

      //get list of items
      let listOfitems = await getDirectoryFileNames(itemDirectory);

      const availableItems = [];
      let items = usercartData.items;

      //loop through, parse and add to available items
      for (const file of listOfitems) {
        const ItemfilePath = path.join(itemDirectory, file);

        const fileContents = await fsPromises.readFile(ItemfilePath, {
          encoding: "utf-8",
        });

        const data = JSON.parse(fileContents);

        availableItems.push(data);
      }

      //If argument matches add item to cart
      /* for (let i = 0; i < availableItems.length; i++) {
        if (args.input.chosenItem === "FOOTBALL") {
          usercartData.items.push(availableItems[0]);
        }
      } */

      if (args.input.chosenItem === availableItemsEnum.FOOTBALL) {
        items.push(availableItems[0]);
      }

      if (args.input.chosenItem === availableItemsEnum.TENNISBALL) {
        items.push(availableItems[1]);
      }

      if (args.input.chosenItem === availableItemsEnum.SHUTTERCOCK) {
        items.push(availableItems[2]);
      }

      if (args.input.chosenItem === availableItemsEnum.BASKETBALL) {
        items.push(availableItems[3]);
      }

      if (args.input.chosenItem === availableItemsEnum.HOCKEYPUCK) {
        items.push(availableItems[4]);
      }

      //Calculate price
      let price = 0;
      for (let i = 0; i < items.length; i++) {
        price += items[i].itemprice;
      }

      //Create updated object
      let updatedUsercart = {
        id: usercartData.id,
        amountOfItems: items.length,
        items: items,
        totalPrice: price,
      };

      //Overwrite file
      await fsPromises.writeFile(
        usercartFilePath,
        JSON.stringify(updatedUsercart)
      );

      //return updatedUsercart;
      return updatedUsercart;
    },
    removeItemFromUsercart: async (_, args) => {
      const { usercartId, chosenItem } = args.input;

      //filepath usercart
      const usercartFilePath = path.join(
        usercartDirectory,
        `${usercartId}.json`
      );

      //Existence check
      const usercartExists = await fileExists(usercartFilePath);
      if (!usercartExists) {
        return new GraphQLError("Den här varukorgen finns inte!");
      }

      //Read the usercart (still in JSON)
      const usercartJSON = await fsPromises.readFile(usercartFilePath, {
        encoding: "utf-8",
      });
      const usercartData = JSON.parse(usercartJSON);

      let items = usercartData.items;
      //console.log(args.input.chosenItem);

      for (let i = 0; i < items.length; i++) {
        console.log(" Det här är " + items[i].name);
        if (chosenItem === items[i].name) {
          items.splice(i, 1);
          console.log("Då tar vi den!");

          break;
        }
      }

      console.log(items);

      //Calculate price
      let price = 0;
      for (let i = 0; i < items.length; i++) {
        price += items[i].itemprice;
      }

      //Create updated object
      let updatedUsercart = {
        id: usercartData.id,
        amountOfItems: items.length,
        items: items,
        totalPrice: price,
      };

      //Overwrite file
      await fsPromises.writeFile(
        usercartFilePath,
        JSON.stringify(updatedUsercart)
      );

      return updatedUsercart;

      //return null;
    },
    deleteUsercart: async (_, args) => {
      //Get the ID
      const usercartId = args.usercartId;

      const filePath = path.join(usercartDirectory, `${usercartId}.json`);

      //Kolla att ID:et finns
      const usercartExists = await fileExists(filePath);
      if (!usercartExists) {
        return new GraphQLError("Den här varukorgen finns inte");
      }

      //Delete file
      try {
        await deleteFile(filePath);
      } catch (error) {
        return {
          deletedId: usercartId,
          success: false,
        };
      }

      return {
        deletedId: usercartId,
        success: true,
      };
    },
  },
};
