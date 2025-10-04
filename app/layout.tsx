import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PR Metrics',
  description: 'Analyze GitHub Pull Request review metrics for teams and individuals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          }
          
          h1 {
            color: #333;
            margin-bottom: 30px;
            text-align: center;
            font-size: 32px;
          }
          
          h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 24px;
          }
          
          .form-group {
            margin-bottom: 25px;
          }
          
          .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 600;
            font-size: 14px;
          }
          
          .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.3s;
          }
          
          .form-group input:focus {
            outline: none;
            border-color: #667eea;
          }
          
          .form-group small {
            display: block;
            margin-top: 5px;
            color: #888;
            font-size: 12px;
          }
          
          .date-range {
            display: flex;
            gap: 15px;
            margin-bottom: 10px;
          }
          
          .date-input-group {
            flex: 1;
          }
          
          .date-input-group label {
            font-size: 13px;
            margin-bottom: 5px;
          }
          
          .or-divider {
            text-align: center;
            margin: 15px 0;
            color: #888;
            font-weight: 600;
            font-size: 14px;
          }
          
          .days-input-group label {
            font-size: 13px;
          }
          
          .submit-btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          
          .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
          }
          
          .submit-btn:active {
            transform: translateY(0);
          }
          
          .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
          
          .loading {
            text-align: center;
            margin-top: 30px;
          }
          
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .loading p {
            color: #666;
            font-size: 16px;
          }
          
          .error {
            background: #fee;
            border: 2px solid #fcc;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            color: #c33;
          }
          
          .results {
            margin-top: 40px;
          }
          
          .metric-card {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #667eea;
          }
          
          .metric-card h3 {
            color: #333;
            margin-bottom: 12px;
            font-size: 18px;
          }
          
          .metric-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          
          .metric-row:last-child {
            border-bottom: none;
          }
          
          .metric-label {
            color: #666;
            font-size: 14px;
          }
          
          .metric-value {
            font-weight: 600;
            color: #333;
            font-size: 14px;
          }
          
          .percentage-bar {
            background: #e0e0e0;
            border-radius: 10px;
            height: 20px;
            margin-top: 5px;
            overflow: hidden;
          }
          
          .percentage-fill {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            height: 100%;
            transition: width 0.5s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 8px;
            color: white;
            font-size: 12px;
            font-weight: 600;
          }
          
          .no-results {
            text-align: center;
            padding: 40px;
            color: #888;
            font-size: 16px;
          }
          
          .summary-stats {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
          }
          
          .stat-item {
            text-align: center;
          }
          
          .stat-value {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 5px;
          }
          
          .stat-label {
            font-size: 13px;
            opacity: 0.9;
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}

