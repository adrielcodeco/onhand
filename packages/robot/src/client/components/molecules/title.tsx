import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

const useStyles = makeStyles({
  titleDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})

export interface TitleProps {
  title: string
  button?: { href: string, text: string }
}

export const Title = ({ title, button }: TitleProps) => {
  const classes = useStyles()
  return (
    <div className={classes.titleDiv}>
      <h1>{title}</h1>
      {button
        ? (
          <Button variant='contained' href={button.href}>
            {button.text}
          </Button>
          )
        : null}
    </div>
  )
}
