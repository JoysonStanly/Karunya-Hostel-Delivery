import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({ open, onClose, title, children }){
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 p-4"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-5 shadow-xl dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-800"
            initial={{ scale: 0.95, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
              <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition text-xl">✕</button>
            </div>
            <div>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
