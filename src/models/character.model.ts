import { DataTypes, Model, Sequelize } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { CharacterStatus } from "../enums/characterStatus.enum.js";
import { CharacterGender } from "../enums/characterGender.enum.js";

export class Character extends Model<InferAttributes<Character>, InferCreationAttributes<Character>> {
  declare id: CreationOptional<number>;
  declare externalId: number;
  declare name: string;
  declare status: CharacterStatus;
  declare species: string;
  declare type: string;
  declare gender: CharacterGender;
  declare originName: string;
  declare locationName: string;
  declare image: string;
  declare episodeCount: number;
  declare lastSyncedAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export const initCharacterModel = (sequelize: Sequelize): void => {
  Character.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      externalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      species: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
      gender: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      originName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      locationName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      episodeCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lastSyncedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: "characters",
      modelName: "Character",
      timestamps: true,
      indexes: [
        {
          fields: ["status"],
        },
        {
          fields: ["species"],
        },
        {
          fields: ["gender"],
        },
        {
          fields: ["episodeCount"],
        },
      ],
    },
  );
};
