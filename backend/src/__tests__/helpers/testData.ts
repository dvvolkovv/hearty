// Simple test data generators (replacement for faker)
export const generateTestEmail = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `test${timestamp}${random}@example.com`
}

export const generateTestPassword = () => 'Password123!'

export const generateFirstName = () => {
  const names = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana']
  return names[Math.floor(Math.random() * names.length)]
}

export const generateLastName = () => {
  const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia']
  return names[Math.floor(Math.random() * names.length)]
}
