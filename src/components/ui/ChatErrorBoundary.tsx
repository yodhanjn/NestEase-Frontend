import { Component, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export default class ChatErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md text-center bg-white border border-gray-100 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">Messages unavailable</h2>
            <p className="text-sm text-gray-500">
              Something went wrong while loading chat. Please refresh the page or open Messages again
              from Booking Requests.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
