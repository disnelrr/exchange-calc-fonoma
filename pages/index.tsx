import { HStack, Text } from "@chakra-ui/react";
import ExchangeCalculator from "@/components/ExchangeCalculator";
import TheLogo from "@/components/TheLogo";

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-start lg:p-24"
    >
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <Text>Exchange Calculator</Text>
        <HStack alignContent="center">
          <Text fontWeight="bold">Made for</Text> <TheLogo />
        </HStack>
      </div>

      <ExchangeCalculator />
    </main>
  );
}
