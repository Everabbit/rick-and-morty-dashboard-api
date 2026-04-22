import { DataTypes, Model, Sequelize } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { SyncStatus } from "../enums/syncStatus.enum.js";

export type SyncRunStatus = "running" | "success" | "failed" | "partial";

export class SyncRun extends Model<
  InferAttributes<SyncRun>,
  InferCreationAttributes<SyncRun>
> {
  declare id: CreationOptional<number>;
  declare startedAt: Date;
  declare finishedAt: CreationOptional<Date | null>;
  declare status: SyncRunStatus;
  declare totalFetched: number;
  declare totalUpserted: number;
  declare totalFailed: number;
  declare retryCount: number;
  declare errorSummary: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export const initSyncRunModel = (sequelize: Sequelize): void => {
  SyncRun.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      finishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          SyncStatus.RUNNING,
          SyncStatus.SUCCESS,
          SyncStatus.FAILED,
          SyncStatus.PARTIAL,
        ),
        allowNull: false,
      },
      totalFetched: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalUpserted: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalFailed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      retryCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      errorSummary: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "sync_runs",
      modelName: "SyncRun",
      timestamps: true,
    },
  );
};
