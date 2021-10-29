import { Modal as MuiModal } from '@mui/material'
import Card from './Card'

export default function Modal({ open, onClose }) {
  return (
    <MuiModal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Card
        style={{
          width: '337.5px',
          maxHeight: '90vh',
          height: 'max-content',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
        }}
        imageWidth="260px"
        showBuyOrSellButton
        history={[]}
        onClose={onClose}
      />
    </MuiModal>
  )
}