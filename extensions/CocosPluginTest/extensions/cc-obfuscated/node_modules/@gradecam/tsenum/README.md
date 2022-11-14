
Description
===========

Typescript supports enum now, but there are times when you may want a little more flexibility than
built-in enums give you; this package was adapted from an example in a gist linked from a typescript
issue which I cannot now find, but suffice it to say that though we have modified it a bit the idea
is not original to us.


Installing
==========

    npm install --save @gradecam/tsenum


Basic Usage
===========

    import {MakeEnum, TypeFromEnum} from 'tsenum';
    
    const Colors = MakeEnum({
        Red: 'red',
        Blue: 'blue',
        Green: 'green',
        Violet: 'violet',
        Black: 'black'
    });
    type Colors = TypeFromEnum<typeof Colors>;

    // type Colors = 'red' | 'blue' | 'green' | 'violet' | 'black'
    // value Colors is a frozen object with the keys expected
    // typeof Colors.Red is 'red', et al

    carColor: Colors = 'red'; // valid
    carColor = Colors.Green; // valid
    carColor = 'yellow'; // typescript error, not a valid color


Combining types
===============

MakeEnum will merge multiple enum objects into one (up to 9), allowing you to combine types.

    import {MakeEnum, TypeFromEnum} from 'tsenum';
    
    const PrimaryColors = MakeEnum({
        Red: 'red',
        Blue: 'blue',
        Green: 'green',
    });
    type PrimaryColors = TypeFromEnum<typeof PrimaryColors>;

    const SecondaryColors = MakeEnum({
        Yellow: 'yellow',
        Cyan: 'cyan',
        Magenta: 'magenta'
    });
    type SecondaryColors = TypeFromEnum<typeof SecondaryColors>;

    const AllColors = MakeEnum(PrimaryColors, SecondaryColors);
    type AllColors = TypeFromEnum<typeof AllColors>;
    // type AllColors = 'red' | 'blue' | 'green' | 'yellow' | 'cyan' | 'magenta'

Getting an array of possible values
===================================

Sometimes you may want an array of possible values, such as when defining an enum type in a mongoose
schema. Since the enum is an object, you can use `Object.values` to get that:

    import {MakeEnum, TypeFromEnum} from 'tsenum';
    
    const PrimaryColors = MakeEnum({
        Red: 'red',
        Blue: 'blue',
        Green: 'green',
    });
    type PrimaryColors = TypeFromEnum<typeof PrimaryColors>;

    const PrimaryColorList = Object.values(PrimaryColors); // ['red', 'blue', 'green']
    // typeof PrimaryColorList = Array<'red'|'blue'|'green'>

Allowed value types
===================

Currently you can use any string, number, or boolean as a value
