// Native fetch is available in Node 18+

async function testSearch() {
    try {
        const response = await fetch('http://localhost:3000/api/product/getAll?search=Panadol&limit=1');
        const data = await response.json();
        console.log(JSON.stringify(data.data[0], null, 2));
    } catch (error) {
        console.error(error);
    }
}

testSearch();
