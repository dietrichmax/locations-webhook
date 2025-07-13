fetch("http://localhost:3000/health")
  .then((response) => {
    if (response.ok) {
      console.log("Health check passed")
    } else {
      console.error("Health check failed")
      process.exit(1) // Exit with error code to signal failure
    }
  })
  .catch((error) => {
    console.error("Health check error:", error.message)
    process.exit(1) // Exit with error code to signal failure
  })
