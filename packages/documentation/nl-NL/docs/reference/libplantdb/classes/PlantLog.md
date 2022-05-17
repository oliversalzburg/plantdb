[@plantdb/libplantdb](../README.md) / [Exports](../modules.md) / PlantLog

# Class: PlantLog

## Constructors

### constructor

• **new PlantLog**()

## Methods

### fromCSV

▸ `Static` **fromCSV**(`databaseFormat`, `plantLogData`): `Object`

**Parameters**

| Name             | Type                                  |
|:---------------- |:------------------------------------- |
| `databaseFormat` | [`DatabaseFormat`](DatabaseFormat.md) |
| `plantLogData`   | `string`[][]                          |

**Returns**

`Object`

| Name         | Type                        |
|:------------ |:--------------------------- |
| `entryTypes` | `Set`<`string`\>           |
| `log`        | [`LogEntry`](LogEntry.md)[] |

**Defined in**

[PlantLog.ts:5](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/PlantLog.ts#L5)
