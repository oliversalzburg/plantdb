# PlantDB-Protokolltabelle erstellen

This is a more in-depth guide to creating your own PlantDB log. If you haven't already, you might want to check out the [Getting Started for Users](../tutorial/getting-started-user.md) guide.

## What you will need

1. A spreadsheet authoring software. Common solutions are:

    - Microsoft Excel
    - LibreOffice Calc
    - Google Sheets

2. Something to label your plants with.

    Plastic labels to stick into the soil and a suitable pen, where the ink doesn't easily wash or rub off, are a great solution. You can also use sticky tape with suitable properties and put those on the put. Writing directly on the pot might reduce reusability of the pot. A low-tech approach is highly recommended in general.

## Instructions

### Creating the spreadsheet

1.  If you haven't already, create a new workbook in your favorite spreadsheet application.

    === "LibreOffice Calc"
   
        ![Empty spreadsheet in LibreOffice Calc](../tutorial/getting-started-user.assets/image-20220511162758319.png)

    === "Microsoft Excel"
   
        ![Empty spreadsheet in Microsoft Excel](../tutorial/getting-started-user.assets/image-20220511171553987.png)

    === "Google Sheets"
   
        ![Empty spreadsheet in Google Sheets](../tutorial/getting-started-user.assets/image-20220511162932148.png)

1.  If you haven't created the default columns yet, do that now. The default columns are:

    -   **PID** - This is the _Plant ID_ of the plant.

        Its unique identifier within your log. All plant IDs are in the format `PID-number`. The `number` should start at `1`.

    -   **Date/Time** - A value that roughly indicates the point in time when this event happened.

        PlantDB does not dictate the format of this value. However, it is important to use some standard format consistently throughout the document. The easiest approach is to just use the convention native to you or what your spreadsheet application inserts when you ask it to insert a date and time.

        !!! note
      
            If you're recording older events and don't know the _exact_ time, it doesn't matter. Just be as precise as you can or want to be. When estimating the day, use `12:00` for the time. When estimating the entire year, use `01/01/1980 12:00`.

    -   **Type** - How you would categorize this event.

        Assigning a specific [event type](../reference/event-types.md) to each recorded event, makes it a lot easier to later use that data. Applications, like the [PlantDB nursery](/nursery), use this type to better understand what you have recorded and offer functionality based on that.

    -   **Note** - Your personal note.

        If you're just recording a watering, there might not be anything to add, but, when you repot a plant, it might make sense to record the state of the roots or if you've noticed anything weird in the soil. Keeping track through notes is one of the most important aspects, and long-lasting benefits of a PlantDB log.

    -   **EC** - The electric conductivity.

        This is a measurement of how well something is eletrically conductive. This is also an indicator of how many salts are dissolved in a nutrient solution. _If_ you are watering or measuring levels in soil or water containers, this would go into this column. If you've never heard of this or don't care about EC, ignore this column.

    -   **pH** - The pH level.

        This is a measurement of how acidic or basic a solution is. Plants usually have a pH range in which they can utilize nutrient most ideally. If the pH strays too far from acceptable levels, some plants even die. _If_ you record pH during watering or measuring levels in soil or watering containers, this would go into this column. If you've never heard of this or don't care about pH, ignore this column.

    -   **Product used** - The name of a product used on the plant.

        If you are fertilizing or applying a pest control product, it is usually a good idea to note down the name of the product for later reference.

    !!! danger

        PlantDB is still in early developement. These are subject to change.

    If you are now asking yourself _"What about height, fruit yield, temperature, ...?"_, don't worry.

### Extending the PlantDB log information

A successful PlantDB log is not hindered by restrictions of any application. If you have to worry about data an application will accept, or if it will allow you to record it in the way that _you_ like, you will not love the result as much as if you could have made it entirely your own.

Add any columns you like. You don't have to fill all values out for all columns for every entry. You only fill out what you need and what you want to fill out. If you start recording something new about your plants, add the new column any time. It doesn't matter if you have the information for your old log entries.

The same goes tracking down information from the past. You suddenly remember the party, where you got that one plant as gift? Great, you can add that into your log now. Just insert the row where you feel it's right and give it a rough Date/Time. You don't even have to keep your log in order. Whenever you want to sort your log, just use the sorting tools available in your spreadsheet application.
