[@plantdb/libplantdb](README.md) / Exports

# @plantdb/libplantdb

## Classes

-   [DatabaseFormat](classes/DatabaseFormat.md)
-   [LogEntry](classes/LogEntry.md)
-   [Plant](classes/Plant.md)
-   [PlantDB](classes/PlantDB.md)
-   [PlantLog](classes/PlantLog.md)

## Type aliases

### DatabaseFormatSerialized

Ƭ **DatabaseFormatSerialized**: `Object`

Describes a plain JS object, containing all the properties required to initialize a `DatabaseFormat`.

#### Type declaration

| Name              | Type                                                      |
|:----------------- |:--------------------------------------------------------- |
| `columnSeparator` | `string`                                                  |
| `dateFormat`      | `string`                                                  |
| `hasHeaderRow`    | `boolean`                                                 |
| `timezone`        | `string`                                                  |
| `typeMap`         | `Record`<`string`, [`EventType`](modules.md#eventtype)\> |

**Defined in**

[DatabaseFormat.ts:64](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L64)

---

### EventType

Ƭ **EventType**: keyof typeof [`EventTypes`](modules.md#eventtypes)

All possible values for internally known event types.

**Defined in**

[DatabaseFormat.ts:58](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L58)

---

### LogEntrySerialized

Ƭ **LogEntrySerialized**: `Object`

Describes an object containing all the fields required to initialize a `LogEntry`.

#### Type declaration

| Name           | Type     | Description                                         |
|:-------------- |:-------- |:--------------------------------------------------- |
| `ec?`          | `number` | The EC value recorded with the entry, if any.       |
| `note?`        | `string` | A note that was recorded with the event, if any.    |
| `ph?`          | `number` | The pH value recorded with the entry, if any.       |
| `plantId`      | `string` | The ID of the plant.                                |
| `productUsed?` | `string` | The product that was used during the event, if any. |
| `timestamp`    | `string` | A string representation of a `Date`.                |
| `type`         | `string` | The user-supplied type of this entry.               |

**Defined in**

[LogEntry.ts:7](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L7)

---

### PlantSerialized

Ƭ **PlantSerialized**: `Object`

Describes an object containing all the fields required to initialize a `Plant`.

#### Type declaration

| Name           | Type        | Description                                    |
|:-------------- |:----------- |:---------------------------------------------- |
| `ecIdeal?`     | `number`    | The ideal EC value for this plant.             |
| `id`           | `string`    | The ID of the plant.                           |
| `kind?`        | `string` \ | `string`[] | The kind (or kinds) of the plant. |
| `location?`    | `string`    | The current location of the plant.             |
| `name?`        | `string`    | The name of the plant.                         |
| `notes?`       | `string`    | Any notes about this plant.                    |
| `onSaucer?`    | `boolean`   | Does the plant current sit on a saucer?        |
| `phIdeal?`     | `number`    | The ideal pH value for this plant.             |
| `potColor?`    | `string`    | The color of the pot.                          |
| `potShapeTop?` | `string`    | The shape of the pot, when viewed from above.  |
| `substrate?`   | `string`    | The current substrate the plant is planted in. |
| `tempIdeal?`   | `number`    | The ideal temperature for this plant.          |

**Defined in**

[Plant.ts:34](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L34)

---

### PotColor

Ƭ **PotColor**: `"Black"` \| `"Brown"` \| `"Grey"` \| `"LightGrey"` \| `"Orange"` \| `"Transparent"` \| `"White"`

Internally understood pot colors.

**Defined in**

[Plant.ts:22](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L22)

---

### PotShapeTop

Ƭ **PotShapeTop**: `"Oval"` \| `"Rectangle"` \| `"Round"` \| `"Square"`

Internally understood pot shapes.

**Defined in**

[Plant.ts:17](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L17)

## Variables

### EventTypes

• `Const` **EventTypes**: `Object`

A hash of internally known event types to a human-readable, English version.

#### Type declaration

| Name              | Type                 | Description                                                                                                    |
|:----------------- |:-------------------- |:-------------------------------------------------------------------------------------------------------------- |
| `Acquisition`     | `"Acquisition"`      | Typically, this marks the first event of a plant, if that plant was acquired (purchased) from a vendor.        |
| `Fertilization`   | `"Fertilization"`    | A plant was fertilized.                                                                                        |
| `Measurement`     | `"Measurement"`      | A measurement has been taken from the plant.                                                                   |
| `Observation`     | `"Observation"`      | Something not further categorizable has been observed about the plant.                                         |
| `PestControl`     | `"Pest Control"`     | A pest situation has been acted on.                                                                            |
| `PestInfestation` | `"Pest Infestation"` | A pest situation has been identified.                                                                          |
| `Pruning`         | `"Pruning"`          | Branches have been pruned.                                                                                     |
| `Relocation`      | `"Relocation"`       | Plant was moved from one location to another one.                                                              |
| `Repotting`       | `"Repotting"`        | Plant was put into a (new) pot. Usually also marks the first event of a plant that was created from a cutting. |
| `RootPruning`     | `"Root pruning"`     | Roots have been pruned.                                                                                        |
| `Shaping`         | `"Shaping"`          | The plant was shaped. For example, through wiring branches. Not to be confused with Pruning.                   |
| `Watering`        | `"Watering"`         | Any form of irrigation                                                                                         |

**Defined in**

[DatabaseFormat.ts:4](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L4)

---

### MATCH_PID

• `Const` **MATCH_PID**: `RegExp`

Matches a Plant ID.

**Defined in**

[Plant.ts:7](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L7)

---

### MATCH_PID_ALL

• `Const` **MATCH_PID_ALL**: `RegExp`

Matches all Plant IDs.

**Defined in**

[Plant.ts:12](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L12)

## Functions

### identifyLogType

▸ **identifyLogType**(`entryType`, `plantDb`): `undefined` \| `"Acquisition"` \| `"Fertilization"` \| `"Measurement"` \| `"Observation"` \| `"Pruning"` \| `"Relocation"` \| `"Repotting"` \| `"Shaping"` \| `"Watering"` \| `"PestControl"` \| `"PestInfestation"` \| `"RootPruning"`

Identify a user-given event type to an internally-known one, based on the information found in a `PlantDB`.

**Parameters**

| Name        | Type                            | Description                                          |
|:----------- |:------------------------------- |:---------------------------------------------------- |
| `entryType` | `string`                        | A type of event as it's given in user-supplied data. |
| `plantDb`   | [`PlantDB`](classes/PlantDB.md) | The plant database that it is found in.              |

**Returns**

`undefined` \| `"Acquisition"` \| `"Fertilization"` \| `"Measurement"` \| `"Observation"` \| `"Pruning"` \| `"Relocation"` \| `"Repotting"` \| `"Shaping"` \| `"Watering"` \| `"PestControl"` \| `"PestInfestation"` \| `"RootPruning"`

The internally-known event type for the user-given event type.

**Defined in**

[Tools.ts:44](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Tools.ts#L44)

---

### kindFlatten

▸ **kindFlatten**(`plantKind`): `string`

Add all the kinds of a plant into a single string.

**Parameters**

| Name        | Type           | Description                                      |
|:----------- |:-------------- |:------------------------------------------------ |
| `plantKind` | `undefined` \ | `string` \| `string`[] | A `kind` if a `Plant`. |

**Returns**

`string`

A string that contains all the kinds the plant.

**Defined in**

[Tools.ts:26](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Tools.ts#L26)

---

### kindSummarize

▸ **kindSummarize**(`plantKind`): `string`

Summarize the kinds in a plant.

**Parameters**

| Name        | Type           | Description                                     |
|:----------- |:-------------- |:----------------------------------------------- |
| `plantKind` | `undefined` \ | `string` \| `string`[] | A `kind` of a `Plant` |

**Returns**

`string`

A string that summarizes the kinds in a plant.

**Defined in**

[Tools.ts:9](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Tools.ts#L9)

---

### roundTo

▸ **roundTo**(`input`, `digits?`): `number`

Round a number to a given number of digits.

**Parameters**

| Name     | Type     | Default value | Description                       |
|:-------- |:-------- |:------------- |:--------------------------------- |
| `input`  | `number` | `undefined`   | A number to round.                |
| `digits` | `number` | `2`           | The amount of digits to round to. |

**Returns**

`number`

The input number rounded to the given number of digits.

**Defined in**

[Tools.ts:58](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Tools.ts#L58)
