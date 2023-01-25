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
const { assertValidExecutionArguments } = require("graphql/execution/execute");
//const axios = require("axios").default;

const usercartDirectory = path.join(__dirname, "..", "data", "usercarts");
const itemDirectory = path.join(__dirname, "..", "data", "items");

const basketball = {
  id: "7b30fcf5-06cb-4f3c-b61e-b560e3476c5b",
  name: "Basketball",
  itemprice: 150,
};

const football = {
  id: "4c7af0ef-af7f-4647-ad77-ee5b90cf9bcf",
  name: "Football",
  itemprice: 100,
};

const tennisball = {
  id: "6cc538fa-c247-4779-8378-6a9a02fc200c",
  name: "Tennisball",
  itemprice: 50,
};

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
  },
  Mutation: {
    createUsercart: async (_, args) => {
      const items = [basketball, tennisball, football];

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
    addItemToUsercart: async (_, args) => {},
    updateUsercart: async (_, args) => {
      const { id, username, amountOfItems, totalPrice } = args;

      const filePath = path.join(usercartDirectory, `${id}.json`);

      const usercartExists = await fileExists(filePath);
      if (!usercartExists)
        return new GraphQLError("Den här varukorgen finns inte");

      const updatedUsercart = {
        id,
        username,
        amountOfItems,
        totalPrice,
      };

      await fsPromises.writeFile(filePath, JSON.stringify(updatedUsercart));

      return updatedUsercart;
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
