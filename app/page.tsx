import { Container, Title, Paper } from '@mantine/core'
import MetricsForm from '@/components/MetricsForm'

export default function Home() {
  return (
    <Container size="lg" py="xl" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Paper shadow="xl" p="xl" radius="md" mt="xl">
        <Title order={1} ta="center" mb="xl" c="violet">
          PR Review Metrics
        </Title>
        <MetricsForm />
      </Paper>
    </Container>
  )
}

