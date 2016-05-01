//==============================================================================
// Dependencies
//==============================================================================

const arrford = require('arrford');     // For turning arrays into lists
const chance = require('chance')();     // For generating dummy data
const config = require('config');       // For reading configuration settings
const faker = require('faker');		// For generating more dummy data
const wrap = require('word-wrap');	// For making string wrapping easier
const pad = require('pad');		// For padding strings
const readline = require('readline');   // For getting user input
const util = require('util');		// For sprintf-like functionality

//==============================================================================
// Functions
//==============================================================================

/**
 * Returns the appropriate prefix (a or an) for a given word
 *
 * If the word starts with a vowel "an" is returned. Otherwise "a" is returned.
 */
var a_or_an = function(word)
{
    var starts_with_vowel = (/^[aeiou]$/i).test(word);
    return (starts_with_vowel ? 'an' : 'a');
}

/**
 * Returns the appropriate prefix (has or has not) for a given state
 *
 * If the state is true "has" is returned. Otherwise "has not" is returned.
 */
var has_or_hasnt = function(state)
{
    return (state ? 'has' : 'hasn\'t');
}

/**
 * Returns the appropriate prefix (has or has not) for a given state
 *
 * If the state is true "has" is returned. Otherwise "doesn't have" is returned.
 */
var has_or_doesnt_have = function(state)
{
   return (state ? 'has' : 'doesn\'t have');
}

/**
 * Generates a random disaster scenario
 */
var get_scenario = function()
{
    var scenario = {
        /*
         * Scenario type (e.g. tsunami, derecho, earthquake...)
         * See `config/default.json` for full list.
         */
        'type': chance.pickone(config.get('scenario.types')),

        /*
         * Time the scenario occurred (in 24-hour time, no formatting)
         * Examples: 0900, 1345, 2399
         */
        'occurred_time': pad(2, chance.integer({min: 0, max: 23}), '0') +
            pad(2, chance.integer({min: 0, max: 59}), '0'),

        /*
         * Number of minutes ago scenario occurred
         */
        'occurred_min_ago': chance.integer({
            min: 5,
            max: 45
        }),

        /*
         * Location of subject user is role playing as
         */
        'subject_location': chance.address(),

        /*
         * Distance from subject's location to disaster site, in miles
         * Usually a number between 0.1 and 3 (to avoid 0), with one number
         * after the decimaml point (e.g. 0.8, 2.9, etc.).
         */
        'subject_distance': chance.floating({
            min: config.get('scenario.distance.min'),
            max: config.get('scenario.distance.max'),
            fixed: 2
        }),

        /*
         * Has 911 been called? (by the subject or someone in the area)
         */
        'is_911_called': chance.bool()
    };

    return scenario;
}

/**
 * Generates a random list of personnel
 */
var get_personnel = function()
{
    personnel = [];
    var num_personnel = chance.integer({
        min: config.get('personnel.numbers.min'),
        max: config.get('personnel.numbers.max')
    });

    for (i = 0; i < num_personnel; i++) {
        var gender = chance.gender().toLowerCase()
        var person = {
            /*
             * Person's age
             * Limited to adult age (child, teen, and senior are also valid).
             */
            'age': chance.age({
                type: 'adult'
            }),

            /*
             * Person's gender
             * Male or female.
             */
            'gender': gender,

            /*
             * Person's (gender-appropriate) name in "first last" format
             */
            'name': chance.name({ gender: gender }),

            /*
             * Person's job in a non-disaster scenario
             */
            'occupation': faker.name.jobArea() + ' ' + faker.name.jobType(),

            /*
             * Does the person have First Aid training?
             * Only 30% of people have First Aid training, as reflected below.
             */
            'first_aid_training': chance.bool({
                likelihood: 30
            }),

            /*
             * Does the person have CPR training?
             * Only 30% of people have CPR training, as reflected below.
             */
            'cpr_training': chance.bool({
                likelihood: 30
            }),

            /*
             * Does the person have search-and-rescue (SAR) training?
             * No idea what percentage of people have SAR training, but it seems
             * less likely than having First Aid/CPR training, so I made the
             * likelihood a lot lower.
             */
            'sar_training': chance.bool({
                likelihood: 10
            }),
        };

        personnel.push(person);
    }

    return personnel;
}

/**
 * Generates a random list of resources
 */
var get_resources = function()
{
    var items = chance.pickset(config.get('resources.items'),
                               chance.integer({ min: 5, max: 20 }));

    for (i = 0; i < items.length; i++) {
        items[i] = chance.integer({ min: 2, max: 10 }) + ' ' + items[i];
    }

    var resources = {
        /*
         * Items available as resources
         * See `config/default.json` for full list.
         */
        'items': items,

        /*
         * Amount of gas (in gallons) on-hand
         */
        'gas': chance.floating({ min: 8.0, max: 40.0, fixed: 1 }),

        /*
         * Amount of cash (in USD) on-hand
         */
        'cash': chance.floating({ min: 15.00, max: 500.00, fixed: 2 })
    }

    return resources;
}

/**
 * Presents generated scenario, personnel, and resources to the user
 */
var main = function()
{
    // Get generated data
    var scenario = get_scenario();
    var personnel = get_personnel();
    var resources = get_resources();

    // Clear screen
    console.log('\033c');

    // Describe scenario
    console.log('Scenario:');
    description = util.format(
        'At approximately %s hours (%d minutes ago) %s %s occurred. ' +
            'You and %d other people are located at %s, an estimated ' +
            '%d miles from the disaster site. 911 %s been called.',
        scenario.occurred_time,
        scenario.occurred_min_ago,
        a_or_an(scenario.type),
        scenario.type,
        personnel.length,
        scenario.subject_location,
        scenario.subject_distance,
        has_or_hasnt(scenario.is_911_called)
    );

    console.log(wrap(description, { width: 80, indent: '  ' }));
    console.log();

    // Describe personnel
    console.log('Personnel:');
    for (i = 0; i < personnel.length; i++) {
        var person = personnel[i];
        var pronoun_1 = (person.gender == 'male' ? 'He' : 'She');
        var pronoun_2 = (person.gender == 'male' ? 'His' : 'Her');

        description = util.format(
            '%s is a %d-year-old %s %s. %s %s First Aid training. %s %s CPR ' +
                'training. %s %s search-and-rescue training. %s other skills ' +
                'are %s.',
            person.name,
            person.age,
            person.gender,
            person.occupation,
            pronoun_1,
            has_or_doesnt_have(person.first_aid_training),
            pronoun_1,
            has_or_doesnt_have(person.cpr_training),
            pronoun_1,
            has_or_doesnt_have(person.sar_training),
            pronoun_2,
            arrford(chance.pickset(config.get('personnel.skills'), 3))
        );

        console.log(wrap(description, { width: 80, indent: '  ' }));
        console.log();
    }

    // Describe resources
    console.log('Resources:');
    for (i = 0; i < resources.items.length; i++) {
        console.log('  - ' + resources.items[i]);
    }

    console.log('  - ' + resources.gas + ' gallons of gas');
    console.log('  - $' + resources.cash + ' in cash');
    console.log();

    // Prompt user for action
    var input = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    input.question('How would you command these personnel and resources ' +
                      'in this scenario?\n', (answer) => {
        input.close();
    });
}

//==============================================================================
// Bootstrapper
//==============================================================================

if (require.main === module) {
    // Do pre-run tasks
    // TBD

    // Call main method
    main();
}
