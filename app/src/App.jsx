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

const COLORS = {
  sand: '#B6A06A',
  forest: '#0B4713',
  ochre: '#D07900',
  graphite: '#313131',
  camel: '#B0967B',
}

const theme = createTheme({
  palette: {
    primary: { main: COLORS.forest },
    secondary: { main: COLORS.ochre },
    text: { primary: COLORS.graphite },
    background: { default: '#faf8f4', paper: '#ffffff' },
    divider: COLORS.sand,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderColor: COLORS.sand },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: { color: COLORS.forest },
      },
    },
  },
})

const MUI_ICONS = {
  Cabin: CabinIcon,
  DoNotDisturb: DoNotDisturbIcon,
  Hiking: HikingIcon,
  Forest: ForestIcon,
  Kayaking: KayakingIcon,
  ShoppingCart: ShoppingCartIcon,
}

function PineTree({ x, y, height: h, width: w, opacity = 0.15 }) {
  const hw = w / 2
  return (
    <g fill={COLORS.forest} opacity={opacity}>
      <polygon points={`${x},${y - h} ${x - hw * 0.35},${y - h * 0.55} ${x + hw * 0.35},${y - h * 0.55}`} />
      <polygon points={`${x},${y - h * 0.65} ${x - hw * 0.65},${y - h * 0.28} ${x + hw * 0.65},${y - h * 0.28}`} />
      <polygon points={`${x},${y - h * 0.38} ${x - hw},${y} ${x + hw},${y}`} />
      <rect x={x - hw * 0.12} y={y} width={hw * 0.24} height={h * 0.1} />
    </g>
  )
}

function PageBackground() {
  const trees = [
    { x: 70,   y: 680, height: 130, width: 64 },
    { x: 170,  y: 720, height:  95, width: 46 },
    { x: 290,  y: 700, height: 150, width: 72 },
    { x: 400,  y: 745, height:  85, width: 42 },
    { x: 880,  y: 715, height: 115, width: 56 },
    { x: 990,  y: 695, height: 140, width: 68 },
    { x: 1090, y: 735, height:  90, width: 44 },
    { x: 1170, y: 705, height: 120, width: 58 },
  ]
  return (
    <Box aria-hidden sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -1, overflow: 'hidden', bgcolor: 'background.default' }}>
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
        <path
          d="M-50,700 L100,480 L220,560 L370,360 L520,510 L670,320 L820,470 L970,350 L1120,450 L1260,680 L1260,800 L-50,800 Z"
          fill={COLORS.sand} opacity="0.25"
        />
        <path
          d="M-50,760 L130,570 L300,650 L480,510 L640,610 L800,490 L970,595 L1120,530 L1260,670 L1260,800 L-50,800 Z"
          fill={COLORS.forest} opacity="0.14"
        />
        <path
          d="M-50,790 Q300,750 600,780 Q900,810 1260,770 L1260,800 L-50,800 Z"
          fill={COLORS.forest} opacity="0.1"
        />
        {trees.map((t, i) => <PineTree key={i} {...t} />)}
      </svg>
    </Box>
  )
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
    <Card variant="outlined" sx={{ backgroundColor: 'rgba(255,255,255,0.75)' }}>
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
            <CheckIcon fontSize="small" color="secondary" />
            <Typography variant="body2" color="secondary">Visited</Typography>
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
      <PageBackground />
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" gutterBottom sx={{ color: COLORS.forest }}>
          Camps & Trails Bucket List
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
              sx={{
                backgroundColor: 'rgba(255,255,255,0.75)',
                '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader, & .MuiDataGrid-scrollbarFiller--header': {
                  backgroundColor: COLORS.camel,
                  color: '#ffffff',
                },
                '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
                '& .MuiDataGrid-columnSeparator': { color: 'rgba(255,255,255,0.3)', visibility: 'visible' },
                '& .MuiDataGrid-sortIcon': { color: '#ffffff' },
                '& .MuiDataGrid-menuIconButton': { color: '#ffffff' },
              }}
            />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  )
}
