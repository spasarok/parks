import { useMemo } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import CheckIcon from '@mui/icons-material/Check'
import HikingIcon from '@mui/icons-material/Hiking'
import CabinIcon from '@mui/icons-material/Cabin'
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb'
import ForestIcon from '@mui/icons-material/Forest'
import KayakingIcon from '@mui/icons-material/Kayaking'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import rawData from '../data/parks.yaml'

const theme = createTheme()

const MUI_ICONS = {
  Cabin: CabinIcon,
  DoNotDisturb: DoNotDisturbIcon,
  Hiking: HikingIcon,
  Forest: ForestIcon,
  Kayaking: KayakingIcon,
  ShoppingCart: ShoppingCartIcon,
}

const campingIconMap = Object.fromEntries(
  (rawData.icons?.campsites ?? []).map(entry => {
    const iconName = entry.icon ?? entry.type
    return [entry.name, { Icon: MUI_ICONS[iconName], alt: entry.alt }]
  })
)

function CampingIcons({ value, height100 }) {
  if (!value?.length) return null
  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', ...(height100 && { height: '100%' }) }}>
      {value.map(name => {
        const entry = campingIconMap[name]
        if (!entry?.Icon) return null
        return (
          <Tooltip key={name} title={entry.alt}>
            <entry.Icon fontSize="small" />
          </Tooltip>
        )
      })}
    </Box>
  )
}

function formatHeader(name) {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const columnWidths = { name: 260, region: 200, distance: 110, campsites: 160 }

const columns = rawData.columns.map(col => ({
  field: col.name,
  headerName: formatHeader(col.name),
  sortable: col.type !== 'array' && col.name !== 'notes',
  ...(col.type === 'boolean' ? { width: 90, align: 'center', headerAlign: 'center', renderCell: ({ value }) => value ? <CheckIcon fontSize="small" /> : '' } : {}),
  ...(col.type === 'array' ? { renderCell: ({ value }) => <CampingIcons value={value} height100 /> } : {}),
  ...(col.name === 'name' ? { renderCell: ({ value, row }) => row.link ? <Link href={row.link} target="_blank" rel="noreferrer" underline="hover">{value}</Link> : value } : {}),
  ...(col.name in columnWidths ? { width: columnWidths[col.name] } : {}),
  ...(col.name === 'notes' ? { flex: 1, minWidth: 200 } : {}),
}))

function ParkCard({ park }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {park.link
            ? <Link href={park.link} target="_blank" rel="noreferrer" underline="hover">{park.name}</Link>
            : park.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {[park.region, park.distance].filter(Boolean).join(' · ')}
        </Typography>
        {park.campsites?.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <CampingIcons value={park.campsites} />
          </Box>
        )}
        {park.notes && (
          <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
            {park.notes}
          </Typography>
        )}
        {park.visited && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <CheckIcon fontSize="small" color="success" />
            <Typography variant="body2" color="success.main">Visited</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default function App() {
  const muiTheme = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))

  const rows = useMemo(
    () =>
      rawData.data.map((park, i) => ({
        id: i,
        link: park.link ?? '',
        ...Object.fromEntries(
          rawData.columns.map(col => [
            col.name,
            col.type === 'boolean'
              ? park[col.name] === true
              : col.type === 'array'
              ? (park[col.name] ?? [])
              : (park[col.name] ?? ''),
          ])
        ),
      })),
    []
  )

  const sortedParks = useMemo(
    () => [...rawData.data].sort((a, b) => a.name.localeCompare(b.name)),
    []
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" gutterBottom>
          Minnesota Parks
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {rawData.data.length} park{rawData.data.length !== 1 ? 's' : ''}
          {!isMobile && ' · Click column headers to sort'}
        </Typography>
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {sortedParks.map(park => (
              <ParkCard key={park.name} park={park} />
            ))}
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
              }}
              disableRowSelectionOnClick
            />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  )
}
