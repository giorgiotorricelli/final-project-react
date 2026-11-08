

function App() {

  const response = fetch('http://localhost:8000/api/movies')
    .then(response => {
      if (!response.ok) {
        throw new Error('Connection or server error');
      }
      return response.json();
    }).then(results => {
      console.log(results);
      
    }).catch(error => {
      console.log(error);
      
    });

  console.log(response);


  return (
    <>

    </>
  )
}

export default App
