import { useMemo } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
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

// Build map from camping name → { Icon, alt } using the YAML icons section
const campingIconMap = Object.fromEntries(
  (rawData.icons?.camping ?? []).map(entry => {
    const iconName = entry.icon ?? entry.type
    return [entry.name, { Icon: MUI_ICONS[iconName], alt: entry.alt }]
  })
)

function CampingIcons({ value }) {
  if (!value?.length) return null
  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%' }}>
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

const columnWidths = { name: 260, region: 200, distance: 110, camping: 160 }

const columns = rawData.columns.map(col => ({
  field: col.name,
  headerName: formatHeader(col.name),
  sortable: col.type !== 'array' && col.name !== 'notes',
  ...(col.type === 'boolean' ? { width: 90, align: 'center', headerAlign: 'center', renderCell: ({ value }) => value ? <CheckIcon fontSize="small" /> : '' } : {}),
  ...(col.type === 'array' ? { renderCell: ({ value }) => <CampingIcons value={value} /> } : {}),
  ...(col.name in columnWidths ? { width: columnWidths[col.name] } : {}),
  ...(col.name === 'notes' ? { flex: 1, minWidth: 200 } : {}),
}))

export default function App() {
  const rows = useMemo(
    () =>
      rawData.data.map((park, i) => ({
        id: i,
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Minnesota Parks
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {rows.length} park{rows.length !== 1 ? 's' : ''} · Click column headers to sort
        </Typography>
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
      </Box>
    </ThemeProvider>
  )
}
