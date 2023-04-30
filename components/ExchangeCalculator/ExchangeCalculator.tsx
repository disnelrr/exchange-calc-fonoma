import CurrencySelect from "@/components/CurrencySelect/CurrencySelect";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  HStack,
  Input,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@chakra-ui/icons";

const myHeaders = new Headers();
myHeaders.append("apikey", `${process.env.NEXT_PUBLIC_API_KEY}`);

const requestOptions = {
  method: "GET",
  redirect: "follow",
  headers: myHeaders,
};

interface CacheProps {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
}

const ExchangeCalculator = () => {
  const [amount, setAmount] = useState("0.0");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(false);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [data, setData] = useState<string[]>([]);
  const [cache, setCache] = useState<CacheProps[]>([]);
  const [lastCurChange, setLastCurChange] = useState(0)

  useEffect(() => {
    async function getCurrencies() {
      fetch(
        "https://api.apilayer.com/exchangerates_data/symbols",
        requestOptions
      )
        .then((response) => response.text())
        .then((result) => {
          const parsedData = JSON.parse(result);
          setData(Object.entries(parsedData.symbols).map((entry) => entry[0]));
          setFromCurrency(data[0]);
          setToCurrency(data[0]);
          setLastCurChange((new Date()).getTime())
        })
        .catch((error) => console.log("error", error));
    }
    const now = new Date();
    const lastChange = new Date(lastCurChange);
    const diff = Math.abs(now - lastChange);

    (data.length === 0 || diff > 86_400_000) && getCurrencies();
  });

  function calculateExchange() {
    if (Number.isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setErrors(true);
      return;
    }

    if (fromCurrency === toCurrency) {
      setResult(amount);
      return;
    }

    setLoading(true);

    function findCachedRate() {
      return cache.find((item) => {
        if (item.from === fromCurrency && item.to === toCurrency) {
          const now = new Date();
          const rateDate = new Date(item.timestamp * 1000);
          const diff = Math.abs(now - rateDate);
          return diff < 600_000;
        }
        return false;
      });
    }

    const currentRate = findCachedRate();
    if (currentRate) {
      setResult((currentRate.rate * parseFloat(amount)).toFixed(2));
      setLoading(false);
    } else {
      fetch(
        `https://api.apilayer.com/exchangerates_data/convert?to=${toCurrency}&from=${fromCurrency}&amount=${amount}`,
        requestOptions
      )
        .then((response) => response.text())
        .then((result) => {
          const data = JSON.parse(result);
          setResult(parseFloat(data.result).toFixed(2));
          const existing = cache.find(
            (item) => item.from === fromCurrency && item.to === toCurrency
          );
          if (existing) {
            setCache(
              cache.map((item) => {
                if (item.from === fromCurrency && item.to === toCurrency) {
                  return {
                    from: item.from,
                    to: item.to,
                    timestamp: data.info.timestamp,
                    rate: data.info.rate,
                  };
                } else {
                  return item;
                }
              })
            );
          } else {
            setCache(
              cache.concat([
                {
                  from: fromCurrency,
                  to: toCurrency,
                  timestamp: data.info.timestamp,
                  rate: data.info.rate,
                },
              ])
            );
          }
          setLoading(false);
        })
        .catch((error) => console.log("error", error));
    }
  }
  return (
    <div className="lg:w-1/3 w-full lg:mx-auto lg:p-10 p-5 mt-10 border-2 border-black rounded-2xl">
      <Input
        placeholder="Enter the amount to convert"
        className="mb-5 text-right"
        value={amount}
        isInvalid={errors}
        onChange={(event) => {
          setErrors(false);
          setResult("");
          setAmount(event.target.value);
        }}
        required
      />
      {errors && (
        <Alert status="error" className="mb-5 rounded-md">
          <AlertIcon />
          <AlertTitle>Wrong amount!</AlertTitle>
          <AlertDescription>Please enter a valid amount.</AlertDescription>
        </Alert>
      )}

      <HStack justify="space-between" className="mb-5">
        <CurrencySelect
          setCurrency={setFromCurrency}
          currencies={data}
        />
        <ArrowRightIcon />
        <CurrencySelect
          setCurrency={setToCurrency}
          currencies={data}
        />
      </HStack>
      <HStack justify="space-between">
        <Tooltip
          label="Select both currencies to make the conversion"
          placement="auto"
          isDisabled={fromCurrency && toCurrency}
        >
          <Button
            variant={"solid"}
            colorScheme="blue"
            onClick={calculateExchange}
            isDisabled={loading || !fromCurrency || !toCurrency}
            isLoading={loading}
            loadingText="Converting"
          >
            Convert
          </Button>
        </Tooltip>
        <Box>
          {loading ? (
            <>{`Converting ${fromCurrency} ${amount} to ${toCurrency} ...`}</>
          ) : (
            result && (
              <Text className="text-xl font-bold">{`Result: ${toCurrency} ${result}`}</Text>
            )
          )}
        </Box>
      </HStack>
    </div>
  );
};

export default ExchangeCalculator;
