[@plantdb/libplantdb](../README.md) / [Exports](../modules.md) / PlantDB

# Class: PlantDB

The main entrypoint of a PlantDB data collection.

## Constructors

### constructor

• **new PlantDB**()

## Accessors

### config

• `get` **config**(): [`DatabaseFormat`](DatabaseFormat.md)

The `DatabaseFormat` used to initialize this database.

**Returns**

[`DatabaseFormat`](DatabaseFormat.md)

**Defined in**

[PlantDB.ts:37](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L37)

---

### entryTypes

• `get` **entryTypes**(): `ReadonlySet`<`string`\>

A cache of all the user-supplied event types in the database.

**Returns**

`ReadonlySet`<`string`\>

**Defined in**

[PlantDB.ts:60](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L60)

---

### kinds

• `get` **kinds**(): `ReadonlySet`<`string`\>

A cache of all the user-supplied plant kinds in the database.

**Returns**

`ReadonlySet`<`string`\>

**Defined in**

[PlantDB.ts:67](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L67)

---

### locations

• `get` **locations**(): `ReadonlySet`<`string`\>

A cache of all the user-supplied locations in the database.

**Returns**

`ReadonlySet`<`string`\>

**Defined in**

[PlantDB.ts:74](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L74)

---

### log

• `get` **log**(): readonly [`LogEntry`](LogEntry.md)[]

The individual log entries, sorted by their timestamp, starting with the oldest.

**Returns**

readonly [`LogEntry`](LogEntry.md)[]

**Defined in**

[PlantDB.ts:53](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L53)

---

### plants

• `get` **plants**(): `ReadonlyMap`<`string`, [`Plant`](Plant.md)\>

A map of plants that are found within the database.
It maps Plant IDs (like "PID-12") to the actual `Plant`.
If you only want the plants themselves, use `plants.values()`.

**Returns**

`ReadonlyMap`<`string`, [`Plant`](Plant.md)\>

**Defined in**

[PlantDB.ts:46](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L46)

---

### potColors

• `get` **potColors**(): `ReadonlySet`<`string`\>

A cache of all the user-supplied pot colors in the database.

**Returns**

`ReadonlySet`<`string`\>

**Defined in**

[PlantDB.ts:81](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L81)

---

### potShapesTop

• `get` **potShapesTop**(): `ReadonlySet`<`string`\>

A cache of all the user-supplied pot shapes in the database.

**Returns**

`ReadonlySet`<`string`\>

**Defined in**

[PlantDB.ts:88](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L88)

---

### substrates

• `get` **substrates**(): `ReadonlySet`<`string`\>

A cache of all the user-supplied substrates in the database.

**Returns**

`ReadonlySet`<`string`\>

**Defined in**

[PlantDB.ts:95](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L95)

---

### usedProducts

• `get` **usedProducts**(): `ReadonlySet`<`string`\>

A cache of all the user-supplied products in the database.

**Returns**

`ReadonlySet`<`string`\>

**Defined in**

[PlantDB.ts:102](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L102)

## Methods

### makeNewLogEntry

▸ **makeNewLogEntry**(`plantId`, `timestamp?`, `type?`): [`LogEntry`](LogEntry.md)

Creates a new log entry that is to be added to the database.

**Parameters**

| Name        | Type     | Default value            | Description                                            |
| :---------- | :------- | :----------------------- | :----------------------------------------------------- |
| `plantId`   | `string` | `undefined`              | The ID of the plant for which this is a new log entry. |
| `timestamp` | `Date`   | `undefined`              | THe date and time this event was recorded at.          |
| `type`      | `string` | `EventTypes.Observation` | The type of the event.                                 |

**Returns**

[`LogEntry`](LogEntry.md)

The created `LogEntry`.

**Defined in**

[PlantDB.ts:190](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L190)

---

### makeNewPlant

▸ **makeNewPlant**(`plantId`): [`Plant`](Plant.md)

Creates a new plant that is to be added to the database.

**Parameters**

| Name      | Type     | Description                    |
| :-------- | :------- | :----------------------------- |
| `plantId` | `string` | The ID of the plant to create. |

**Returns**

[`Plant`](Plant.md)

The created `Plant`.

**Defined in**

[PlantDB.ts:215](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L215)

---

### toCSV

▸ **toCSV**(`databaseFormat?`): `Object`

**Parameters**

| Name             | Type                                  |
| :--------------- | :------------------------------------ |
| `databaseFormat` | [`DatabaseFormat`](DatabaseFormat.md) |

**Returns**

`Object`

| Name     | Type     |
| :------- | :------- |
| `log`    | `string` |
| `plants` | `string` |

**Defined in**

[PlantDB.ts:311](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L311)

---

### withNewLog

▸ **withNewLog**(`log`): [`PlantDB`](PlantDB.md)

Returns a copy of this `PlantDB`, but with an entirely new log.

**Parameters**

| Name  | Type                                 | Description                   |
| :---- | :----------------------------------- | :---------------------------- |
| `log` | readonly [`LogEntry`](LogEntry.md)[] | The new log for the database. |

**Returns**

[`PlantDB`](PlantDB.md)

The new `PlantDB`.

**Defined in**

[PlantDB.ts:119](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L119)

---

### withNewLogEntry

▸ **withNewLogEntry**(`logEntry`): [`PlantDB`](PlantDB.md)

Returns a copy of this `PlantDB`, but with a new entry added to its log.

If the referenced plant does not exist, it will be created in the new database.

**Parameters**

| Name       | Type                      | Description                           |
| :--------- | :------------------------ | :------------------------------------ |
| `logEntry` | [`LogEntry`](LogEntry.md) | The log entry to add to the database. |

**Returns**

[`PlantDB`](PlantDB.md)

The new `PlantDB`.

**Defined in**

[PlantDB.ts:131](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L131)

---

### withUpdatedLogEntry

▸ **withUpdatedLogEntry**(`updatedLogEntry`, `oldLogEntry`): [`PlantDB`](PlantDB.md)

**Parameters**

| Name              | Type                      |
| :---------------- | :------------------------ |
| `updatedLogEntry` | [`LogEntry`](LogEntry.md) |
| `oldLogEntry`     | [`LogEntry`](LogEntry.md) |

**Returns**

[`PlantDB`](PlantDB.md)

**Defined in**

[PlantDB.ts:142](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L142)

---

### withUpdatedPlant

▸ **withUpdatedPlant**(`updatedPlant`, `oldPlant`): [`PlantDB`](PlantDB.md)

**Parameters**

| Name           | Type                |
| :------------- | :------------------ |
| `updatedPlant` | [`Plant`](Plant.md) |
| `oldPlant`     | [`Plant`](Plant.md) |

**Returns**

[`PlantDB`](PlantDB.md)

**Defined in**

[PlantDB.ts:166](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L166)

---

### withoutLogEntry

▸ **withoutLogEntry**(`logEntry`): [`PlantDB`](PlantDB.md)

**Parameters**

| Name       | Type                      |
| :--------- | :------------------------ |
| `logEntry` | [`LogEntry`](LogEntry.md) |

**Returns**

[`PlantDB`](PlantDB.md)

**Defined in**

[PlantDB.ts:159](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L159)

---

### withoutPlant

▸ **withoutPlant**(`plant`): [`PlantDB`](PlantDB.md)

**Parameters**

| Name    | Type                |
| :------ | :------------------ |
| `plant` | [`Plant`](Plant.md) |

**Returns**

[`PlantDB`](PlantDB.md)

**Defined in**

[PlantDB.ts:175](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L175)

---

### Empty

▸ `Static` **Empty**(): [`PlantDB`](PlantDB.md)

Returns an empty `PlantDB`.

**Returns**

[`PlantDB`](PlantDB.md)

**Defined in**

[PlantDB.ts:109](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L109)

---

### fromCSV

▸ `Static` **fromCSV**(`databaseFormat`, `plantDataRaw`, `plantLogDataRaw`): [`PlantDB`](PlantDB.md)

Constructs a new `PlantDB` based on information found in CSV data.

**Parameters**

| Name              | Type                                  | Description                                                   |
| :---------------- | :------------------------------------ | :------------------------------------------------------------ |
| `databaseFormat`  | [`DatabaseFormat`](DatabaseFormat.md) | The `DatabaseFormat` that explains how to interpret the data. |
| `plantDataRaw`    | `string`                              | The raw plant CSV data.                                       |
| `plantLogDataRaw` | `string`                              | The raw plant log CSV data.                                   |

**Returns**

[`PlantDB`](PlantDB.md)

A new `PlantDB` with the information found in the CSV data.

**Defined in**

[PlantDB.ts:264](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L264)

---

### fromJSObjects

▸ `Static` **fromJSObjects**(`databaseFormat`, `plants?`, `plantLogData?`): [`PlantDB`](PlantDB.md)

Constructs a new `PlantDB` based on some plain JavaScript initialization hashes.

**Parameters**

| Name             | Type                                                       | Default value | Description                                       |
| :--------------- | :--------------------------------------------------------- | :------------ | :------------------------------------------------ |
| `databaseFormat` | [`DatabaseFormat`](DatabaseFormat.md)                      | `undefined`   | The `DatabaseFormat` to use for the new database. |
| `plants`         | [`PlantSerialized`](../modules.md#plantserialized)[]       | `[]`          | The plants to put into the database.              |
| `plantLogData`   | [`LogEntrySerialized`](../modules.md#logentryserialized)[] | `[]`          | The log data to put into the database.            |

**Returns**

[`PlantDB`](PlantDB.md)

A new `PlantDB` initialized with the given data.

**Defined in**

[PlantDB.ts:326](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L326)

---

### fromPlantDB

▸ `Static` **fromPlantDB**(`other`, `initializer?`): [`PlantDB`](PlantDB.md)

Construct a new PlantDB, based on the data in another one, and also optionally override
some of its properties.

**Parameters**

| Name           | Type                                | Description                                                           |
| :------------- | :---------------------------------- | :-------------------------------------------------------------------- |
| `other`        | [`PlantDB`](PlantDB.md)             | The `PlantDB` to initialize the new one from.                         |
| `initializer?` | `Partial`<[`PlantDB`](PlantDB.md)\> | A hash that contains additional fields to copy into the new instance. |

**Returns**

[`PlantDB`](PlantDB.md)

A new `PlantDB` with the provided arguments merged into it.

**Defined in**

[PlantDB.ts:228](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/PlantDB.ts#L228)
