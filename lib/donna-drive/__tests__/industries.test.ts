import { normalizeDriveIndustry } from '../industries'

describe('DONNA Drive industries', () => {
  it.each([
    ['real_estate', 'real_estate'],
    ['Real Estate', 'real_estate'],
    ['professional-services', 'professional_services'],
    [' Hospitality ', 'hospitality'],
  ])('normalizes %s to %s', (value, expected) => {
    expect(normalizeDriveIndustry(value)).toBe(expected)
  })

  it('rejects unknown industries instead of silently changing them', () => {
    expect(normalizeDriveIndustry('not-an-industry')).toBeNull()
  })
})
