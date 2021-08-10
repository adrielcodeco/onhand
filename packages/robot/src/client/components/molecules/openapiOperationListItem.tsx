import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LockIcon from '@material-ui/icons/Lock'
import Typography from '@material-ui/core/Typography'

const getColors = { fill: '#61affe', bg: 'rgba(97,175,254,.1)' }
const postColors = { fill: '#49cc90', bg: 'rgba(73,204,144,.1)' }
const putColors = { fill: '#fca130', bg: 'rgba(252,161,48,.1)' }
const deleteColors = { fill: '#f93e3e', bg: 'rgba(249,62,62,.1)' }

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #000',
    borderRadius: '4px',
    boxShadow: '0 0 3px rgb(0 0 0 / 19%)',
    margin: '0 0 15px',
    padding: '5px 0',
    cursor: 'pointer',
  },
  cardLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    '& > *': {
      margin: '0 5px',
    },
  },
  method: {
    borderRadius: '3px',
    color: '#fff',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    fontWeight: 700,
    minWidth: '80px',
    padding: '6px 0px',
    textAlign: 'center',
    textShadow: '0 1px 0 rgb(0 0 0 / 10%)',
  },
  path: {
    fontWeight: 'bold',
  },
  desc: {
    color: 'gray',
  },
  lock: {
    margin: '0 5px',
    color: 'gray',
  },
  'card-get': {
    borderColor: getColors.fill,
    background: getColors.bg,
  },
  'method-get': {
    background: getColors.fill,
  },
  'card-post': {
    borderColor: postColors.fill,
    background: postColors.bg,
  },
  'method-post': {
    background: postColors.fill,
  },
  'card-put': {
    borderColor: putColors.fill,
    background: putColors.bg,
  },
  'method-put': {
    background: putColors.fill,
  },
  'card-delete': {
    borderColor: deleteColors.fill,
    background: deleteColors.bg,
  },
  'method-delete': {
    background: deleteColors.fill,
  },
})

export interface OpenApiOperationListItemProps {
  method: string
  path: string
  description: string
  authenticated: boolean
  compact: boolean
  onClick: () => void
}

export const OpenApiOperationListItem = ({
  method,
  path,
  description,
  authenticated,
  compact,
  onClick,
}: OpenApiOperationListItemProps) => {
  const classes = useStyles()
  return (
    <div
      className={[classes.card, (classes as any)[`card-${method}`]].join(' ')}
      onClick={onClick}
    >
      <div className={classes.cardLeft}>
        <span
          className={[
            classes.method,
            (classes as any)[`method-${method}`],
          ].join(' ')}
        >
          {method.toUpperCase()}
        </span>
        <Typography variant='subtitle1' className={classes.path}>
          {path}
        </Typography>
        {!compact
          ? (
            <Typography variant='body2' className={classes.desc}>
              {description}
            </Typography>
            )
          : null}
      </div>
      {authenticated && !compact ? <LockIcon className={classes.lock} /> : null}
    </div>
  )
}
