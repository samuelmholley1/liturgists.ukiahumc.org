import Airtable from 'airtable'

// Initialize Airtable with PAT token
const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_PAT_TOKEN,
})

const base = airtable.base(process.env.AIRTABLE_BASE_ID || '')
const table = base(process.env.AIRTABLE_TABLE_NAME || 'liturgists.ukiahumc.org')

export interface SignupData {
  serviceDate: string
  displayDate: string
  name: string
  email: string
  phone?: string
  role: 'Liturgist' | 'Backup Liturgist' | 'Attendance'
  attendanceStatus?: 'Yes' | 'No' | 'Maybe'
  notes?: string
}

/**
 * Submit a signup to Airtable
 */
export async function submitSignup(data: SignupData) {
  try {
    const record = await table.create([
      {
        fields: {
          'Service Date': data.serviceDate,
          'Display Date': data.displayDate,
          'Name': data.name,
          'Email': data.email,
          'Phone': data.phone || '',
          'Role': data.role,
          'Attendance Status': data.attendanceStatus || '',
          'Notes': data.notes || '',
          'Submitted At': new Date().toISOString(),
        },
      },
    ])

    return { success: true, record: record[0] }
  } catch (error) {
    console.error('Error submitting to Airtable:', error)
    return { success: false, error }
  }
}

/**
 * Get all signups from Airtable
 */
export async function getSignups() {
  try {
    const records = await table.select().all()
    
    return records.map((record) => ({
      id: record.id,
      serviceDate: record.get('Service Date'),
      displayDate: record.get('Display Date'),
      name: record.get('Name'),
      email: record.get('Email'),
      phone: record.get('Phone'),
      role: record.get('Role'),
      attendanceStatus: record.get('Attendance Status'),
      notes: record.get('Notes'),
      submittedAt: record.get('Submitted At'),
    }))
  } catch (error) {
    console.error('Error fetching from Airtable:', error)
    return []
  }
}

/**
 * Get a single signup record by ID
 */
export async function getSignupById(recordId: string) {
  try {
    const record = await table.find(recordId)
    return {
      success: true,
      record: {
        id: record.id,
        serviceDate: record.get('Service Date'),
        displayDate: record.get('Display Date'),
        name: record.get('Name'),
        email: record.get('Email'),
        phone: record.get('Phone'),
        role: record.get('Role'),
        attendanceStatus: record.get('Attendance Status'),
        notes: record.get('Notes'),
        submittedAt: record.get('Submitted At'),
      }
    }
  } catch (error) {
    console.error('Error fetching record from Airtable:', error)
    return { success: false, error }
  }
}

/**
 * Delete a signup from Airtable by record ID
 */
export async function deleteSignup(recordId: string) {
  try {
    await table.destroy([recordId])
    return { success: true }
  } catch (error) {
    console.error('Error deleting from Airtable:', error)
    return { success: false, error }
  }
}

export { table }
