import React, { useState, useEffect } from 'react'
import {
  Card,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Tooltip,
  Button,
  DialogActions
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMember } from '../../features/members/membersSlice'

function getOrdinal(day) {
  if (day % 100 >= 11 && day % 100 <= 13) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
  const dt = new Date(year, month - 1, day)
  const monthName = dt.toLocaleString('en-US', { month: 'long' })
  return `${monthName} ${day}${getOrdinal(day)}, ${year}`
}

const statusColors = {
  Completed:     '#4caf50',
  'In Review':   '#ff9800',
  'Not Started': '#f44336',
  'In Progress': '#2196f3'
}

export default function TaskCard({ task, onDelete }) {
  const dispatch   = useDispatch()
  const members    = useSelector(state => state.members.entities)
  const ids        = React.useMemo(
    () => Array.isArray(task.employeeIds) ? task.employeeIds : [],
    [task.employeeIds]
  )

  const [detailOpen, setDetailOpen]         = useState(false)
  const [listOpen, setListOpen]             = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => {
    ids.forEach(id => {
      if (!members[id]) dispatch(fetchMember(id))
    })
  }, [ids, members, dispatch])

  const openDetail = id => {
    const mem = members[id]
    if (mem) setSelectedMember(mem)
    setDetailOpen(true)
  }

  const closeDetail = () => {
    setDetailOpen(false)
    setSelectedMember(null)
  }

  const [confirmOpen, setConfirmOpen] = useState(false)

  const openConfirm = e => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmOpen(true)
  }
  const closeConfirm = () => setConfirmOpen(false)

  const handleDelete = async () => {
    await onDelete(task.id)
    setConfirmOpen(false)
  }

  return (
    <>
      <Card
        component={Link}
        to={`/tasks/${task.id}`}
        variant="outlined"
        sx={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 0.8fr 2fr auto',
          alignItems: 'center',
          p: 2,
          gap: 2,
          borderRadius: 4,
          textDecoration: 'none',
          color: 'inherit',
          transition: 'transform 0.15s, box-shadow 0.15s',
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 24px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Typography variant="body1">{task.name}</Typography>

        <Typography variant="body2" color="text.secondary">
          {formatDate(task.dateCreated)}
        </Typography>

        <Chip
          label={task.status}
          sx={{
            bgcolor: statusColors[task.status] || 'grey',
            color: 'white',
            borderRadius: '8px',
            pointerEvents: 'none',
            cursor: 'default'
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', pl: 4 }}>
          {ids.slice(0, 2).map((id, idx) => {
            const mem = members[id]
            if (!mem) return null
            return (
              <Tooltip key={id} title="See Employee" arrow>
                <Avatar
                  onClick={e => { e.preventDefault(); openDetail(id) }}
                  sx={{
                    width: 32,
                    height: 32,
                    cursor: 'pointer',
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    ml: idx === 0 ? 0 : '-4px',
                    zIndex: ids.length - idx,
                    boxShadow: '0 0 2px 2px rgba(255,255,255,0.8)'
                  }}
                >
                  {mem.firstName.charAt(0)}
                </Avatar>
              </Tooltip>
            )
          })}
          {ids.length > 2 && (
            <Tooltip title="Employee List" arrow>
              <Avatar
                onClick={e => { e.preventDefault(); setListOpen(true) }}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(33,150,243,0.1)',
                  color: 'primary.dark',
                  cursor: 'pointer',
                  ml: '-8px',
                  zIndex: 0,
                  boxShadow: '0 0 4px 2px rgba(255,255,255,0.8)'
                }}
              >
                +{ids.length - 2}
              </Avatar>
            </Tooltip>
          )}
        </Box>

        {task.status === 'Completed' && onDelete ? (
          <Tooltip title="Delete Task" arrow>
            <IconButton
              onClick={openConfirm}
              size="small"
              sx={{
                bgcolor: 'error.light',
                color: 'common.white',
                width: 32,
                height: 32,
                '&:hover': { bgcolor: 'error.main' }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ width: 32, height: 32 }} />
        )}
      </Card>

      <Dialog open={confirmOpen} onClose={closeConfirm}>
        <DialogTitle>
          {`Are you sure you want to delete task "${task.name}"?`}
        </DialogTitle>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailOpen} onClose={closeDetail}>
        <DialogTitle sx={{ position: 'relative', pr: 6 }}>
          Employee Details
          <IconButton
            onClick={closeDetail}
            sx={{ position: 'absolute', right: 8, top: 10 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedMember ? (
            <>
              <Typography><strong>ID:</strong> {selectedMember.id}</Typography>
              <Typography><strong>First:</strong> {selectedMember.firstName}</Typography>
              <Typography><strong>Last:</strong> {selectedMember.lastName}</Typography>
              <Typography><strong>DOB:</strong> {selectedMember.dob}</Typography>
            </>
          ) : (
            <Typography>Loading…</Typography>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={listOpen}
        onClose={() => setListOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Assigned Employees
          <IconButton
            onClick={() => setListOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {ids.map(id => {
              const mem = members[id]
              if (!mem) return null
              return (
                <Grid item xs={4} key={id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Tooltip title="See Employee" arrow>
                      <Avatar
                        onClick={e => { e.preventDefault(); openDetail(id); setListOpen(false) }}
                        sx={{
                          width: 48,
                          height: 48,
                          cursor: 'pointer',
                          bgcolor: 'primary.main',
                          color: 'common.white'
                        }}
                      >
                        {mem.firstName.charAt(0)}
                      </Avatar>
                    </Tooltip>
                    <Typography variant="caption">{mem.firstName}</Typography>
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  )
}
