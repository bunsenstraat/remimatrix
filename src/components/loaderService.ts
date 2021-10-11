import { BehaviorSubject } from "rxjs";

export class LoaderService {
    loading = new BehaviorSubject<boolean>(false)
    
    setLoading(isLoading:boolean){
        this.loading.next(isLoading)
    }
}