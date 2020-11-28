export class SolutionModel {
  idSolution: number;
  solutionDescription: string;
}

export class SolutionFilter {
  parent?: any;
  id: string;
  label: string;
  selected: boolean;
}
