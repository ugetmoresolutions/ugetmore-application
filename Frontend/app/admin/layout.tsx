import AdminLayout from '@/components/admin/AdminLayout'
import React from 'react'

function layout({children}: {children: React.ReactNode}) {
  return (
    <div>
      <AdminLayout>
        {children}
      </AdminLayout>
    </div>
  )
}

export default layout
