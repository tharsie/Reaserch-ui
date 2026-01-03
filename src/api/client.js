import axios from 'axios'

// Placeholder API client.
// There is no real backend in this UI-only project; callers should gracefully fall back to mock data.
const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

export default client
