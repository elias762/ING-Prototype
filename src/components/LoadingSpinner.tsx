function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-brand" />
    </div>
  )
}

export default LoadingSpinner
