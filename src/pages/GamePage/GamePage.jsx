import { useParams } from "react-router-dom";

import { Cards } from "../../components/Cards/Cards";
import { useCount } from "../../components/hooks/useCount";

export function GamePage() {
  const { pairsCount } = useParams();
  const { count, getCount, lostCount, getLost } = useCount();
  return (
    <>
      <Cards
        pairsCount={parseInt(pairsCount, 10)}
        previewSeconds={5}
        count={count}
        getCount={getCount}
        lostCount={lostCount}
        getLost={getLost}
      ></Cards>
    </>
  );
}
