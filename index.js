const getRandomNumber = () =>{
    const randomNumber = Math.floor(Math.random() * 1000) + 1;
    console.log(randomNumber);
    return randomNumber;
};

getRandomNumber();
export default getRandomNumber;
