////////////////////////////////////////////////////////////////////////////////
// DEPENDENCIES
////////////////////////////////////////////////////////////////////////////////

// External dependencies
var faker = require('faker');		// For generating dummy data
var chance = require('chance')();       // For generating better random numbers
var wrap = require('word-wrap');	// For making console printing prettier
var pad = require('pad');

////////////////////////////////////////////////////////////////////////////////
// METHODS
////////////////////////////////////////////////////////////////////////////////

var main = function()
{
    // Configuration
    var MIN_PERSONNEL_COUNT = 3;        // Min number of personnel to generate
    var MAX_PERSONNEL_COUNT = 7;	// Max number of personnel to generate
    var MIN_SUBJECT_DISTANCE = 0.1;     // Minimum distance from scenario (mi)
    var MAX_SUBJECT_DISTANCE = 5.0;     // Maximum distabce from scenario (mi)

    // Clear screen
    console.log('\033c');

    // Generate scenario
    var disaster_types = [
        'tsunami',
        'derecho',
        'earthquake',
        'volcanic eruption',
        'tornado',
        'hurricane',
        'drought',
        'heat wave',
        'wild fire',
        'ice storm',
        'snowstorm',
        'avalanche',
        'hail storm',
        'landslide',
        'flood',
        'active shooting event'
    ];

    var scenario = {
        'type': chance.pickone(disaster_types),
        'location': chance.address({ short_suffix: true }),
        'time': pad(4, chance.integer({ min: 0000, max: 2399 }), '0'),
        'time_ago': chance.integer({ min: 10, max: 45 }),
        'distance': chance.floating({ min: MIN_SUBJECT_DISTANCE,
                                      max: MAX_SUBJECT_DISTANCE,
                                      fixed: 2})
    };

    // Generate personnel
    var personnel = [];
    var personnel_count = chance.integer({min: MIN_PERSONNEL_COUNT,
                                          max: MAX_PERSONNEL_COUNT});

    for (var i = 0; i < personnel_count; i++) {
        var gender = faker.helpers.randomize(['male', 'female']);
        var name = chance.name({ gender: gender });
        var job = faker.name.jobArea() + ' ' + faker.name.jobType();
        var age = chance.age({ type: 'adult' });
        var has_first_aid_training = chance.bool({ likelihood: 30 });
        var has_cpr_training = chance.bool({ likelihood: 30 });

        var person = {
            'name': name,
            'gender': gender,
            'age': age,
            'job': job,
            'has_first_aid_training': has_first_aid_training,
            'has_cpr_training': has_cpr_training
        };

        personnel.push(person);
    }

    // Describe scenario
    console.log('Scenario: ');
    var article = (/^[aeiou]$/i).test(scenario.type.charAt(0)) ? 'an' : 'a';

    var scenario_desc = 'At approximately ' + scenario.time + ' hours (' +
        scenario.time_ago + ' minutes ago) ' + article + ' ' + scenario.type +
        ' occurred. You and ' + personnel_count + ' others are located at ' +
        scenario.location + ', an estimated ' + scenario.distance + ' mi from' +
        ' the disaster site.';

    console.log(wrap(scenario_desc, { width: 80, indent: '    ' }));
    console.log();

    // Describe personnel
    console.log('Personnel:');

    for (var i = 0; i < personnel_count; i++) {
        var person = personnel[i];
        var pronoun = (person.gender == 'male' ? 'He' : 'She');
        var has_fa = (person.has_first_aid_training ? 'has' : 'does not have');
        var has_cpr = (person.has_cpr_training ? 'has' : 'does not have');

        var personnel_desc = person.name + ' is a ' + person.age + '-year-old ' +
            person.gender + ' ' + person.job + '. ' + pronoun + ' ' + has_fa +
            ' First Aid training. ' + pronoun + ' ' + has_cpr + ' CPR training.';

        console.log(wrap(personnel_desc, { width: 80, indent: '    ' }));
        console.log();
    }

    console.log('How would you command these personnel in this scenario?');
}

////////////////////////////////////////////////////////////////////////////////
// BOOTSTRAPPER
////////////////////////////////////////////////////////////////////////////////

if (require.main === module) main();
