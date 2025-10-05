import { Container, Title, Paper } from '@mantine/core'
import { MetricsForm } from '@/components/MetricsForm'

export default function Home() {
  return (
    <Container size="xl" py="lg" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontSize: '15px', maxWidth: '1600px' }}>
      <Paper shadow="xl" p="xl" radius="md" mt="lg">
        <Title order={1} ta="center" mb="lg" c="violet" size="h1">
          PR Review Metrics
        </Title>
        <MetricsForm />
      </Paper>
    </Container>
  )
}

