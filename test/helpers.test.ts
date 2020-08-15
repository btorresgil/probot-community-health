import { sortResultsByValue } from '../src/helpers'
// Requiring our fixtures
import {
  unsortedResultsFixture,
  sortedResultsFixture,
} from './fixtures/sort-results'

describe('sortResultsByValue', () => {
  test('sorts the results by value', () => {
    const unsorted = unsortedResultsFixture
    const expected = sortedResultsFixture
    const result = sortResultsByValue(unsorted)
    expect(result).toEqual(expected)
  })
})
