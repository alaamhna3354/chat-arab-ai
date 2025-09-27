function useModalConfirm(component: any) {
    const overlay = useOverlay()
    const modal = overlay.create(component)
  
    return async (props: Record<string, any> = {}) => {
      const instance = modal.open(props)
      return await instance.result
    }
  }
  