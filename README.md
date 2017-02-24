# ligand-binding-processing

Command line utils to process ligand binding data.
Most programs accept a file parameter or input from stdin.
Consult the help (`--help`) for the parameter names and more details.

## aggregate

A dataset may contain multiple entries for a molecule receptor pair.
`aggregate` calculates the average and limits the max Ki value to 10000.
It also adds the property `scaledKiValue`, which contains the Ki value scaled to a range from 0 to 10000.
The property `binds` is also added.
It is `1` if the Ki value is below 10000 and `0` if the Ki value is 10000.

## alternative

Generates entries with an alternative SMILES representation using Open Babel.
The number of alternatives could be lower than the given number if Open Babel generates duplicates.

## build-nn-mapping

Generates the mapping description for `nn-mapping` and the I/O names for the neural network model.
Expects `mapping` or `model` as the first parameter to choose which kind of file will be generated.
The property for the output (`kiValue`, `scaledKiValue`, `binds`) must be given.

## canonicalize

Converts the SMILES representation to the canonical form using Open Babel.
This should be done before running `aggregate`.

## from-chembl

Searches for targets on a SPARQL endpoint and generates the ligand binding data.
If the first parameter is `target` it will search for targets which contain the given string in the label.
`binding` as the first parameter will generate the ligand binding data.
The target can be given like in the target search or as IRIs.

## info

Shows information about the ligand binding data.
`count` will return the number of entries.
`histogram` shows a histogram of the distribution of Ki values.
The data can be filtered by Ki value.
This can be useful to count the number of pairs which don't bind.

## merge

Merges multiple ligand binding data files together.
Useful after splitting the ligand binding data to generate test data.

## split

Splits ligand binding data based on offset and limit.
The data can be sorted or shuffled before.

## tokenize

Generates an array of SMILES tokens for each entry.
Should be done at the end for faster data processing.
