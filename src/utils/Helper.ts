class Helper {
    public static setDecimals(number: string | number, decimals: number) {
        number = number.toString();
        const numberAbs = number.split('.')[0];
        let numberDecimals = number.split('.')[1] ? number.split('.')[1] : '';
        while (numberDecimals.length < decimals) {
            numberDecimals += '0';
        }
        return numberAbs + numberDecimals;
    }
}

export default Helper;