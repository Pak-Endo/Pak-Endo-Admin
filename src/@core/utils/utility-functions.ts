export const generateUniqueID = (speakerName: string | null | undefined) => {
  function generateRandomString(length: any) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }
  const initials = speakerName?.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
  const randomString = generateRandomString(8);
  const uniqueID = initials + randomString;
  return uniqueID;
}